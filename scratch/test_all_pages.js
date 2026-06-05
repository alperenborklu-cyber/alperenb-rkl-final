const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const blogDir = path.join(rootDir, 'blog');

// Get all html files from root and blog directories
const htmlFiles = [];
fs.readdirSync(rootDir).forEach(file => {
    if (file.endsWith('.html')) {
        htmlFiles.push({
            name: file,
            path: path.join(rootDir, file),
            urlPath: '/' + file.replace('.html', '')
        });
    }
});

if (fs.existsSync(blogDir)) {
    fs.readdirSync(blogDir).forEach(file => {
        if (file.endsWith('.html')) {
            htmlFiles.push({
                name: 'blog/' + file,
                path: path.join(blogDir, file),
                urlPath: '/blog/' + file.replace('.html', '')
            });
        }
    });
}

console.log(`Found ${htmlFiles.length} HTML files to test.`);

// Safe require function that clears cache to reload script.js every time
function testPage(fileInfo) {
    const html = fs.readFileSync(fileInfo.path, 'utf8');
    
    // Extract data-i18n elements
    const mockTranslatableElements = [];
    const dataI18nRegex = /data-i18n="([^"]+)"([^>]*?>)([\s\S]*?)</g;
    let match;
    while ((match = dataI18nRegex.exec(html)) !== null) {
        const key = match[1];
        const rest = match[2];
        const initialHTML = match[3].trim();
        
        mockTranslatableElements.push({
            key: key,
            getAttribute: (attr) => attr === 'data-i18n' ? key : null,
            setAttribute: () => {},
            tagName: rest.toUpperCase().includes('INPUT') ? 'INPUT' : 'DIV',
            _innerHTML: initialHTML,
            get innerHTML() { return this._innerHTML; },
            set innerHTML(val) { this._innerHTML = val; }
        });
    }

    let classList = new Set();
    let langInitialized = false;

    // Reset globals for each run
    global.fbq = () => {};
    global.window = {
        location: {
            pathname: fileInfo.urlPath,
            origin: 'https://alperenborklu.com',
            search: '',
            href: 'https://alperenborklu.com' + fileInfo.urlPath
        },
        addEventListener: () => {},
        matchMedia: () => ({ matches: true })
    };

    global.document = {
        documentElement: {
            lang: 'tr',
            classList: {
                add: (cls) => {
                    classList.add(cls);
                    if (cls === 'lang-initialized') langInitialized = true;
                },
                remove: (cls) => classList.delete(cls),
                contains: (cls) => classList.has(cls)
            }
        },
        addEventListener: (event, callback) => {
            if (event === 'DOMContentLoaded') {
                callback();
            }
        },
        getElementById: () => null,
        getElementsByTagName: () => [{ parentNode: { insertBefore: () => {} } }],
        querySelectorAll: (selector) => {
            if (selector === '[data-i18n]') return mockTranslatableElements;
            if (selector.startsWith('a[')) return [];
            return [];
        },
        querySelector: (selector) => {
            if (selector === '[data-i18n^="blog_"][data-i18n$="_title"]') {
                return mockTranslatableElements.find(el => el.key.endsWith('_title'));
            }
            if (selector.startsWith('meta[')) {
                return { content: '' };
            }
            return null;
        },
        createElement: () => ({ 
            appendChild: () => {},
            querySelector: () => null,
            textContent: ''
        }),
        head: { appendChild: () => {} }
    };

    global.localStorage = {
        getItem: () => 'tr',
        setItem: () => {}
    };

    global.IntersectionObserver = class {
        observe() {}
        unobserve() {}
    };

    // Reload script.js
    delete require.cache[require.resolve('../script.js')];
    
    try {
        require('../script.js');
        if (!langInitialized) {
            console.error(`❌ ${fileInfo.name}: script executed but html class lang-initialized was NOT added!`);
            return false;
        }
        return true;
    } catch (err) {
        console.error(`💥 ${fileInfo.name} CRASHED:`, err.message);
        return false;
    }
}

let successCount = 0;
let failCount = 0;

for (const fileInfo of htmlFiles) {
    const success = testPage(fileInfo);
    if (success) {
        successCount++;
    } else {
        failCount++;
    }
}

console.log(`\nTest completed: ${successCount} passed, ${failCount} failed.`);
process.exit(failCount > 0 ? 1 : 0);
