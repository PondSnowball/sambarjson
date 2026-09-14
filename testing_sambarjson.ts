import {
    convertSambarjsonToJson,
    convertJsonToSambarjson,
    isValidJson
} from './sambarjson';

// Utility helper for test assertions and clean console output
function runTest(description: string, testFn: () => void, expectedSuccess: boolean = true): void {
    try {
        testFn();
        if (expectedSuccess) {
            console.log(`\x1b[32m[PASS]\x1b[0m ${description}`);
        } else {
            console.error(`\x1b[31m[FAIL]\x1b[0m ${description} (Expected failure, but passed)`);
        }
    } catch (error) {
        if (!expectedSuccess) {
            console.log(`\x1b[32m[PASS]\x1b[0m ${description} (Caught expected error)`);
        } else {
            const msg = error instanceof Error ? error.message : String(error);
            console.error(`\x1b[31m[FAIL]\x1b[0m ${description} -> ${msg}`);
        }
    }
}

function runTestSuite(): void {
    console.log('\n=== 1. Empty & Minimal Inputs ===');

    runTest('Empty JSON Object', () => {
        const res = convertSambarjsonToJson('{}');
        if (JSON.stringify(JSON.parse(res)) !== '{}') {
            throw new Error('Failed to parse empty object');
        }
    });

    runTest('Empty RAWSTRING Block', () => {
        const input = '{"key": __RAWSTRINGSTART____RAWSTRINGFINSIH__}';
        const res = convertSambarjsonToJson(input);
        if (JSON.parse(res).key !== '') {
            throw new Error('Empty RAWSTRING should evaluate to an empty string');
        }
    });

    console.log('\n=== 2. RAWSTRING Edge Cases ===');

    runTest('RAWSTRING Special Characters & Escapes', () => {
        const input = `{
  "content": __RAWSTRINGSTART__
Line 1
Line 2: "quoted" \\ path \\ t tabbed
__RAWSTRINGFINSIH__
}`;
        const res = convertSambarjsonToJson(input);
        const data = JSON.parse(res);
        const expected = 'Line 1\nLine 2: "quoted" \\ path \\ t tabbed';
        if (data.content !== expected) {
            throw new Error(`Content mismatch. Received:\n${data.content}`);
        }
    });

    console.log('\n=== 3. Complex Nested Structures ===');

    const complexInput = `{
  "id": 505,
  "config_name": __CLASSICJSONSTART__{"name": "Standard Config", "version": "1.0", "enabled": true}__CLASSICJSONFINISH__,
  "payload": __RAWSTRINGSTART__
<p>Hello "World"</p>
C:\\Users\\Admin
__RAWSTRINGFINSIH__,
  "embedded_tree": __SAMBARJSONSTART__
  {
    "sub_id": 99,
    "active": true,
    "tags": ["alpha", "beta"],
    "inner_config": __CLASSICJSONSTART__{"name": "Inner Config", "version": "A.1", "enabled": false}__CLASSICJSONFINISH__
  }
  __SAMBARJSONFINISH__
}`;

    runTest('Complex Inner Config & Nested Tree Parsing', () => {
        const jsonStr = convertSambarjsonToJson(complexInput);
        const parsed = JSON.parse(jsonStr);

        if (parsed.id !== 505) throw new Error("Mismatch in 'id'");
        if (parsed.config_name !== '{"name": "Standard Config", "version": "1.0", "enabled": true}') {
            throw new Error("Mismatch in 'config_name'");
        }
        if (parsed.embedded_tree.sub_id !== 99) throw new Error("Mismatch in 'embedded_tree.sub_id'");
        if (parsed.embedded_tree.tags[1] !== 'beta') throw new Error("Mismatch in 'embedded_tree.tags'");
        if (parsed.embedded_tree.inner_config !== '{"name": "Inner Config", "version": "A.1", "enabled": false}') {
            throw new Error("Mismatch in 'inner_config'");
        }
    });

    console.log('\n=== 4. Round-Trip Parity ===');

    runTest('JSON -> sambarJSON -> JSON', () => {
        const original = {
            id: 505,
            multiline: 'Line 1\nLine 2 with "quotes"',
            path: 'C:\\Program Files\\App'
        };
        const jsonOrig = JSON.stringify(original);
        const sambarVersion = convertJsonToSambarjson(jsonOrig);
        const jsonBack = convertSambarjsonToJson(sambarVersion);

        if (JSON.stringify(JSON.parse(jsonBack)) !== jsonOrig) {
            throw new Error('Parity mismatch between original and reconstructed JSON');
        }
    });

    console.log('\n=== 5. JSON Validation Helper (isValidJson) ===');

    runTest('isValidJson - Valid JSON String', () => {
        if (!isValidJson('{"name": "TypeScript", "valid": true}')) {
            throw new Error('Expected valid JSON to return true');
        }
    });

    runTest('isValidJson - Invalid JSON String', () => {
        // Suppress expected console.error during negative test
        const originalError = console.error;
        console.error = () => {};
        
        const result = isValidJson('{ invalid_json: true, }');
        
        console.error = originalError;
        if (result !== false) {
            throw new Error('Expected invalid JSON to return false');
        }
    });

    runTest('isValidJson - Non-string input', () => {
        if (isValidJson(12345 as unknown)) {
            throw new Error('Expected non-string input to return false');
        }
    });
}

// Run test suite
runTestSuite();