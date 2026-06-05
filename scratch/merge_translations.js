const fs = require('fs');
const path = require('path');

const workspaceDir = "c:\\Users\\Alp\\Downloads\\alperen börklü website final";
const bakPath = path.join(workspaceDir, "script.js.bak");
const currPath = path.join(workspaceDir, "script.js");

function extractTranslations(content) {
    const start = content.indexOf('const translations =');
    if (start === -1) throw new Error("Could not find translations");
    
    let braceCount = 0;
    let end = -1;
    let started = false;
    for (let i = start; i < content.length; i++) {
        if (content[i] === '{') {
            braceCount++;
            started = true;
        } else if (content[i] === '}') {
            braceCount--;
            if (started && braceCount === 0) {
                end = i + 1;
                break;
            }
        }
    }
    if (end === -1) throw new Error("Could not find matching closing brace");
    const code = content.slice(start, end) + ';\n(translations);';
    // Use eval safely
    const translations = eval(code);
    return { translations, start, end };
}

try {
    const bakContent = fs.readFileSync(bakPath, 'utf8');
    const currContent = fs.readFileSync(currPath, 'utf8');

    const bak = extractTranslations(bakContent);
    const curr = extractTranslations(currContent);

    // Merge keys
    const mergedTranslations = {
        en: { ...bak.translations.en, ...curr.translations.en },
        tr: { ...bak.translations.tr, ...curr.translations.tr }
    };

    // Construct the new JavaScript code
    const translationsString = "const translations = " + JSON.stringify(mergedTranslations, null, 4) + ";";
    
    // Replace the translations object in the current script.js content
    const newContent = currContent.slice(0, curr.start) + translationsString + currContent.slice(curr.end);

    fs.writeFileSync(currPath, newContent, 'utf8');
    console.log("Successfully merged translations. English keys:", Object.keys(mergedTranslations.en).length, ", Turkish keys:", Object.keys(mergedTranslations.tr).length);

} catch (err) {
    console.error("Error during merge:", err);
}
