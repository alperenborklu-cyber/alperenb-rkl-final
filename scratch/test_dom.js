const fs = require('fs');
const path = require('path');

// Parse blog.html to extract translatable elements
const blogHtmlPath = path.join(__dirname, '..', 'blog.html');
const blogHtml = fs.readFileSync(blogHtmlPath, 'utf8');

// Parse all data-i18n elements
const mockTranslatableElements = [];
const dataI18nRegex = /data-i18n="([^"]+)"([^>]*?>)([\s\S]*?)</g;
let match;
while ((match = dataI18nRegex.exec(blogHtml)) !== null) {
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
        pathname: '/blog',
        origin: 'https://alperenborklu.com'
    },
    addEventListener: () => {},
    matchMedia: () => ({ matches: true })
};
global.document = {
    documentElement: {
        lang: 'tr',
        classList: {
            add: (cls) => console.log(`[DOM Mock] Added class: ${cls}`),
            remove: (cls) => console.log(`[DOM Mock] Removed class: ${cls}`),
            contains: (cls) => false
        }
    },
    addEventListener: (event, callback) => {
        if (event === 'DOMContentLoaded') {
            // Run immediately
            callback();
        }
    },
    getElementById: () => null,
    querySelectorAll: (selector) => {
        // Mock querySelectorAll for data-i18n and a tags
        if (selector === '[data-i18n]') {
            return mockTranslatableElements;
        }
        if (selector.startsWith('a[')) {
            return [];
        }
        return [];
    },
    querySelector: (selector) => {
        if (selector === '#preloader' || selector === '.fixed.inset-0.z-1000') {
            return null;
        }
        if (selector === 'header button') return null;
        if (selector === '.md\\:hidden.absolute') return null;
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

console.log("Found translatable elements in blog.html:", mockTranslatableElements.length);

// Now load and execute script.js
require('../script.js');

// Check what the innerHTML of some blog elements became after script.js ran
console.log("\nResults of some translations:");
const blog1Title = mockTranslatableElements.find(el => el.key === 'blog_1_title');
const blog1Desc = mockTranslatableElements.find(el => el.key === 'blog_1_desc');
const blog63Title = mockTranslatableElements.find(el => el.key === 'blog_63_title');
const blog63Desc = mockTranslatableElements.find(el => el.key === 'blog_63_desc');

console.log("blog_1_title HTML:", blog1Title ? blog1Title.innerHTML : "Not found");
console.log("blog_1_desc HTML:", blog1Desc ? blog1Desc.innerHTML : "Not found");
console.log("blog_63_title HTML:", blog63Title ? blog63Title.innerHTML : "Not found");
console.log("blog_63_desc HTML:", blog63Desc ? blog63Desc.innerHTML : "Not found");
