const fs = require('fs');
const path = require('path');

const scriptPath = path.join(__dirname, '..', 'script.js');
let scriptContent = fs.readFileSync(scriptPath, 'utf8');

// Normalize newlines in script content to LF
scriptContent = scriptContent.replace(/\r\n/g, '\n');

// Target 1: Language init and setLanguage function
const target1 = `    // Check URL query parameters first, then localStorage, defaulting to 'tr'
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    let currentLang = urlLang || localStorage.getItem('lang') || 'tr';
    if (urlLang) {
        localStorage.setItem('lang', urlLang);
    }

    function setLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('lang', lang);

        if(langToggleBtn) langToggleBtn.innerText = lang === 'en' ? 'TR' : 'EN';
        if(langToggleBtnMobile) langToggleBtnMobile.innerText = lang === 'en' ? 'TR' : 'EN';
        if(langToggleBtnHeader) langToggleBtnHeader.innerText = lang === 'en' ? 'TR' : 'EN';

        document.documentElement.lang = lang;`;

const replacement1 = `    // Helper to safely access localStorage
    function getStoredLang() {
        try {
            return localStorage.getItem('lang');
        } catch (e) {
            return null;
        }
    }
    
    function setStoredLang(lang) {
        try {
            localStorage.setItem('lang', lang);
        } catch (e) {
            // Ignore storage blocking exceptions
        }
    }

    // Check URL query parameters first, then localStorage, defaulting to 'tr'
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    let currentLang = urlLang || getStoredLang() || 'tr';
    
    // Normalize language to either 'en' or 'tr'
    if (currentLang !== 'en' && currentLang !== 'tr') {
        if (typeof currentLang === 'string' && currentLang.toLowerCase().startsWith('en')) {
            currentLang = 'en';
        } else {
            currentLang = 'tr';
        }
    }
    
    if (urlLang) {
        setStoredLang(currentLang);
    }

    function setLanguage(lang) {
        // Enforce valid language code
        if (lang !== 'en' && lang !== 'tr') {
            if (typeof lang === 'string' && lang.toLowerCase().startsWith('en')) {
                lang = 'en';
            } else {
                lang = 'tr';
            }
        }
        currentLang = lang;
        setStoredLang(lang);

        if(langToggleBtn) langToggleBtn.innerText = lang === 'en' ? 'TR' : 'EN';
        if(langToggleBtnMobile) langToggleBtnMobile.innerText = lang === 'en' ? 'TR' : 'EN';
        if(langToggleBtnHeader) langToggleBtnHeader.innerText = lang === 'en' ? 'TR' : 'EN';

        document.documentElement.lang = lang;`;

// Target 2: titleText accessing translations[lang] directly
const target2 = `const titleText = translations[lang][key];`;
const replacement2 = `const titleText = translations[lang] ? translations[lang][key] : null;`;

// Target 3: contentHTML accessing translations[lang] directly
const target3 = `const contentHTML = translations[lang][contentKey];`;
const replacement3 = `const contentHTML = translations[lang] ? translations[lang][contentKey] : null;`;

// Helper normalize for targets just in case
const norm = (str) => str.replace(/\r\n/g, '\n').trim();

if (!norm(scriptContent).includes(norm(target1))) {
    console.error("Target 1 not found in script.js!");
    process.exit(1);
}

if (!norm(scriptContent).includes(norm(target2))) {
    console.error("Target 2 not found in script.js!");
    process.exit(1);
}

if (!norm(scriptContent).includes(norm(target3))) {
    console.error("Target 3 not found in script.js!");
    process.exit(1);
}

scriptContent = scriptContent.replace(norm(target1), norm(replacement1));
scriptContent = scriptContent.replace(norm(target2), norm(replacement2));
scriptContent = scriptContent.replace(norm(target3), norm(replacement3));

fs.writeFileSync(scriptPath, scriptContent, 'utf8');
console.log("Successfully patched script.js logic and made it crash-proof!");
