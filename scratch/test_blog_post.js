const fs = require('fs');
const path = require('path');

// Parse a blog post file to extract translatable elements
const postPath = path.join(__dirname, '..', 'blog', '2026da-vfx-ve-animasyon-sektoru.html');
const postHtml = fs.readFileSync(postPath, 'utf8');

// Parse all data-i18n elements
const mockTranslatableElements = [];
const dataI18nRegex = /data-i18n="([^"]+)"([^>]*?>)([\s\S]*?)</g;
let match;
while ((match = dataI18nRegex.exec(postHtml)) !== null) {
    const key = match[1];
    const rest = match[2];
    const initialHTML = match[3].trim();
    
    const el = {
        key: key,
        getAttribute: (attr) => attr === 'data-i18n' ? key : null,
        setAttribute: () => {},
        tagName: rest.toUpperCase().includes('INPUT') ? 'INPUT' : 'DIV',
        _innerHTML: initialHTML,
        get innerHTML() { return this._innerHTML; },
        set innerHTML(val) { this._innerHTML = val; }
    };
    mockTranslatableElements.push(el);
}

// Mock browser globals
global.window = {
    location: {
        pathname: '/blog/2026da-vfx-ve-animasyon-sektoru',
        origin: 'https://alperenborklu.com'
    },
    addEventListener: () => {},
    matchMedia: () => ({ matches: true })
};
global.document = {
    documentElement: {
        lang: 'en',
        classList: {
            add: (cls) => console.log(`[DOM Mock] Added class: ${cls}`),
            remove: (cls) => console.log(`[DOM Mock] Removed class: ${cls}`),
            contains: (cls) => false
        }
    },
    addEventListener: (event, callback) => {
        if (event === 'DOMContentLoaded') {
            callback();
        }
    },
    getElementById: () => null,
    querySelectorAll: (selector) => {
        if (selector === '[data-i18n]') {
            return mockTranslatableElements;
        }
        if (selector.startsWith('a[')) {
            return [];
        }
        return [];
    },
    querySelector: (selector) => {
        if (selector === '[data-i18n^="blog_"][data-i18n$="_title"]') {
            return mockTranslatableElements.find(el => el.key.endsWith('_title'));
        }
        if (selector === 'meta[name="description"]') {
            return { content: '' };
        }
        if (selector === 'meta[property="og:description"]') {
            return { content: '' };
        }
        if (selector === 'meta[name="twitter:description"]') {
            return { content: '' };
        }
        if (selector === 'meta[property="og:title"]') {
            return { content: '' };
        }
        if (selector === 'meta[name="twitter:title"]') {
            return { content: '' };
        }
        if (selector === 'meta[property="og:locale"]') {
            return { content: '' };
        }
        if (selector === 'meta[property="og:locale:alternate"]') {
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
    getItem: () => 'en',
    setItem: () => {}
};
global.IntersectionObserver = class {
    observe() {}
    unobserve() {}
};

console.log("Found translatable elements in blog post HTML:", mockTranslatableElements.length);

// Load and execute script.js
require('../script.js');

console.log("\nResults of blog post translation:");
const blog3Title = mockTranslatableElements.find(el => el.key === 'blog_3_title');
const blog3Content = mockTranslatableElements.find(el => el.key === 'blog_3_content');

console.log("blog_3_title HTML:", blog3Title ? blog3Title.innerHTML : "Not found");
console.log("blog_3_content HTML length:", blog3Content ? blog3Content.innerHTML.length : "Not found");
