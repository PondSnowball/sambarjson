/**
 * Converts a sambarJSON string into a standard, formatted JSON string.
 * @param {string} sambarjsonStr 
 * @returns {string} Standard JSON string with 2-space indentation.
 */
function convertSambarjsonToJson(sambarjsonStr) {
    let processed = sambarjsonStr;

    // 1. Handle RAWSTRING: wraps inner text as a standard JSON string literal (escaped)
    const stringPattern = /__RAWSTRINGSTART__([\s\S]*?)__RAWSTRINGFINSIH__/g;
    processed = processed.replace(stringPattern, (_, rawText) => {
        if (rawText.startsWith('\n')) rawText = rawText.slice(1);
        if (rawText.endsWith('\n')) rawText = rawText.slice(0, -1);
        return JSON.stringify(rawText);
    });

    // 2. Handle SAMBARJSON: splices sambar JSON objects/arrays directly into the structure (no quotes)
    const sambarjsonPattern = /__SAMBARJSONSTART__([\s\S]*?)__SAMBARJSONFINISH__/g;
    processed = processed.replace(sambarjsonPattern, (_, fragment) => {
        return fragment.trim();
    });

    // 3. Handle CLASSICJSON: treats inner content with explicit standard escaping rules
    const classicPattern = /__CLASSICJSONSTART__([\s\S]*?)__CLASSICJSONFINISH__/g;
    processed = processed.replace(classicPattern, (_, classicText) => {
        return JSON.stringify(classicText.trim());
    });

    // Final validation and clean formatting
    return JSON.stringify(JSON.parse(processed), null, 2);
}

/**
 * Converts a standard JSON string into sambarJSON format.
 * Multi-line strings, backslashes, or quotes are converted into __RAWSTRINGSTART__ blocks.
 * @param {string} jsonStr 
 * @returns {string} sambarJSON formatted string.
 */
function convertJsonToSambarjson(jsonStr) {
    const data = JSON.parse(jsonStr);

    function customDump(obj, indent = 2) {
        const dumped = JSON.stringify(obj, null, indent);

        // Regex to match string values inside standard JSON
        const stringPattern = /"([^"\\]*(?:\\.[^"\\]*)*)"/g;
        return dumped.replace(stringPattern, (match, innerContent) => {
            // Unescape JSON escape sequences
            const unescaped = innerContent
                .replace(/\\"/g, '"')
                .replace(/\\\\/g, '\\')
                .replace(/\\n/g, '\n')
                .replace(/\\t/g, '\t')
                .replace(/\\r/g, '\r');

            if (unescaped.includes('\n') || unescaped.includes('"') || unescaped.includes('\\')) {
                return `__RAWSTRINGSTART__\n${unescaped}\n__RAWSTRINGFINSIH__`;
            }
            return match;
        });
    }

    return customDump(data);
}

/**
 * Validates whether a given string is valid standard JSON.
 * @param {string} data 
 * @returns {boolean}
 */
function isValidJson(data) {
    if (typeof data !== 'string') return false;
    try {
        JSON.parse(data);
        return true;
    } catch (e) {
        console.error(`JSON Error: ${e.message}`);
        return false;
    }
}