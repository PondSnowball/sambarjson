/**
 * Converts a sambarJSON string into a standard, formatted JSON string.
 * @param sambarjsonStr - The input sambarJSON string to process.
 * @returns Standard JSON string formatted with 2-space indentation.
 */
export function convertSambarjsonToJson(sambarjsonStr: string): string {
    let processed: string = sambarjsonStr;

    // 1. Handle RAWSTRING: wraps inner text as a standard JSON string literal (escaped)
    const stringPattern = /__RAWSTRINGSTART__([\s\S]*?)__RAWSTRINGFINSIH__/g;
    processed = processed.replace(stringPattern, (_: string, rawText: string) => {
        if (rawText.startsWith('\n')) rawText = rawText.slice(1);
        if (rawText.endsWith('\n')) rawText = rawText.slice(0, -1);
        return JSON.stringify(rawText);
    });

    // 2. Handle SAMBARJSON: splices sambar JSON objects/arrays directly into the structure (no quotes)
    const sambarjsonPattern = /__SAMBARJSONSTART__([\s\S]*?)__SAMBARJSONFINISH__/g;
    processed = processed.replace(sambarjsonPattern, (_: string, fragment: string) => {
        return fragment.trim();
    });

    // 3. Handle CLASSICJSON: treats inner content with explicit standard escaping rules
    const classicPattern = /__CLASSICJSONSTART__([\s\S]*?)__CLASSICJSONFINISH__/g;
    processed = processed.replace(classicPattern, (_: string, classicText: string) => {
        return JSON.stringify(classicText.trim());
    });

    // Final validation and clean formatting
    return JSON.stringify(JSON.parse(processed), null, 2);
}

/**
 * Converts a standard JSON string into sambarJSON format.
 * Multi-line strings, backslashes, or quotes are converted into __RAWSTRINGSTART__ blocks.
 * @param jsonStr - Standard JSON string.
 * @returns sambarJSON formatted string.
 */
export function convertJsonToSambarjson(jsonStr: string): string {
    const data: unknown = JSON.parse(jsonStr);

    function customDump(obj: unknown, indent: number = 2): string {
        const dumped = JSON.stringify(obj, null, indent);

        // Regex to match string values inside standard JSON
        const stringPattern = /"([^"\\]*(?:\\.[^"\\]*)*)"/g;
        return dumped.replace(stringPattern, (match: string, innerContent: string) => {
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
 * @param data - The string to check.
 * @returns True if valid JSON string, false otherwise.
 */
export function isValidJson(data: unknown): boolean {
    if (typeof data !== 'string') return false;
    try {
        JSON.parse(data);
        return true;
    } catch (e) {
        if (e instanceof Error) {
            console.error(`JSON Error: ${e.message}`);
        } else {
            console.error(`JSON Error: ${String(e)}`);
        }
        return false;
    }
}