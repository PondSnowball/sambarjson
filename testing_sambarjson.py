import json
import traceback
import sambarjson as sj

def run_test(name, func, expected_success=True):
    """Utility runner to execute a test case and print clean output."""
    print(f"[{'TEST':^6}] {name}")
    try:
        result = func()
        if expected_success:
            print(f"  --> PASSED")
            return result
        else:
            print(f"  --> FAILED (Expected exception, but succeeded)")
            return None
    except Exception as e:
        if not expected_success:
            print(f"  --> PASSED (Caught expected error: {type(e).__name__})")
        else:
            print(f"  --> FAILED (Unexpected error)")
            print(f"      {type(e).__name__}: {e}")
        return None

def test_suite():
    print("==================================================")
    print("      SAMBARJSON SIMPLE TEST CASES     ")
    print("==================================================\n")

    # ----------------------------------------------------
    # 1. EMPTY & MINIMAL INPUTS
    # ----------------------------------------------------
    print("--- 1. Empty & Minimal Inputs ---")

    def test_empty_json():
        res = sj.convert_sambarjson_to_json("{}")
        assert json.loads(res) == {}

    def test_empty_rawstring():
        inp = '{"key": __RAWSTRINGSTART____RAWSTRINGFINSIH__}'
        res = sj.convert_sambarjson_to_json(inp)
        assert json.loads(res)["key"] == ""

    def test_empty_classicjson():
        inp = '{"key": __CLASSICJSONSTART____CLASSICJSONFINISH__}'
        res = sj.convert_sambarjson_to_json(inp)
        assert json.loads(res)["key"] == ""

    run_test("Empty JSON Object", test_empty_json)
    run_test("Empty RAWSTRING Block", test_empty_rawstring)
    run_test("Empty CLASSICJSON Block", test_empty_classicjson)

    # ----------------------------------------------------
    # 2. RAWSTRING EDGE CASES
    # ----------------------------------------------------
    print("\n--- 2. RAWSTRING Edge Cases ---")

    def test_rawstring_special_chars():
        # Newlines, backslashes, tabs, quotes
        inp = '''{
          "content": __RAWSTRINGSTART__
Line 1
Line 2: "quoted" \ path \ t tabbed
__RAWSTRINGFINSIH__
        }'''
        res = sj.convert_sambarjson_to_json(inp)
        data = json.loads(res)
        assert data["content"] == 'Line 1\nLine 2: "quoted" \\ path \\ t tabbed'

    def test_rawstring_leading_trailing_newlines():
        # Verify the single leading/trailing newline trimming logic
        inp = '{"k": __RAWSTRINGSTART__\nExact Text\n__RAWSTRINGFINSIH__}'
        res = sj.convert_sambarjson_to_json(inp)
        assert json.loads(res)["k"] == "Exact Text"

    def test_rawstring_unicode():
        inp = '{"k": __RAWSTRINGSTART__\n🔥 Special Chars: ✨ 🚀 \n__RAWSTRINGFINSIH__}'
        res = sj.convert_sambarjson_to_json(inp)
        assert json.loads(res)["k"] == "🔥 Special Chars: ✨ 🚀 "

    run_test("RAWSTRING Escapes & Quotes", test_rawstring_special_chars)
    run_test("RAWSTRING Boundary Newline Trimming", test_rawstring_leading_trailing_newlines)
    run_test("RAWSTRING Unicode / Emojis", test_rawstring_unicode)

    # ----------------------------------------------------
    # 3. CLASSICJSON EDGE CASES
    # ----------------------------------------------------
    print("\n--- 3. CLASSICJSON Edge Cases ---")

    def test_classicjson_stringification():
        # CLASSICJSON wraps stringified inner text inside quotes
        inp = '{"data": __CLASSICJSONSTART__ {"inner": 123} __CLASSICJSONFINISH__}'
        res = sj.convert_sambarjson_to_json(inp)
        parsed = json.loads(res)
        # Note: CLASSICJSON stringifies the content inside
        assert parsed["data"] == '{"inner": 123}'

    run_test("CLASSICJSON Stringification Handling", test_classicjson_stringification)

    # ----------------------------------------------------
    # 4. SAMBARJSON NESTING & SPLICE CASES
    # ----------------------------------------------------
    print("\n--- 4. SAMBARJSON Nesting & Splices ---")

    def test_sambarjson_nested_splicing():
        inp = '''{
          "outer_key": __SAMBARJSONSTART__
          {
            "inner_array": [1, 2, 3],
            "inner_val": "hello"
          }
          __SAMBARJSONFINISH__
        }'''
        res = sj.convert_sambarjson_to_json(inp)
        data = json.loads(res)
        assert data["outer_key"]["inner_array"] == [1, 2, 3]

    def test_sambarjson_array_splice():
        inp = '[1, 2, __SAMBARJSONSTART__ [3, 4] __SAMBARJSONFINISH__]'
        res = sj.convert_sambarjson_to_json(inp)
        data = json.loads(res)
        assert data == [1, 2, [3, 4]]

    run_test("SAMBARJSON Nested Object Splice", test_sambarjson_nested_splicing)
    run_test("SAMBARJSON Array Splice", test_sambarjson_array_splice)

    # ----------------------------------------------------
    # 5. ROUND-TRIP CONVERSION (JSON -> SAMBARJSON -> JSON)
    # ----------------------------------------------------
    print("\n--- 5. Round-Trip Conversions ---")

    def test_roundtrip_complex():
        original = {
            "id": 101,
            "multiline_str": "Line 1\nLine 2 with \"quotes\"",
            "path_str": "C:\\Program Files\\App",
            "plain_str": "Simple String",
            "nested": {"a": True, "b": None}
        }
        json_orig = json.dumps(original)
        
        # Convert JSON -> SAMBARJSON
        sambar_version = sj.convert_json_to_sambarjson(json_orig)
        
        # Convert SAMBARJSON -> JSON
        json_back = sj.convert_sambarjson_to_json(sambar_version)
        
        # Validate data parity
        assert json.loads(json_back) == original

    run_test("Round-Trip Data Parity", test_roundtrip_complex)

    # ----------------------------------------------------
    # 6. MALFORMED / ERROR HANDLING CASES
    # ----------------------------------------------------
    print("\n--- 6. Malformed Input & Failure Cases ---")

    def test_unclosed_tag():
        inp = '{"k": __RAWSTRINGSTART__ Unclosed block }'
        res = sj.convert_sambarjson_to_json(inp)
        # Should raise JSONDecodeError when trying to parse unparsed tags
        json.loads(res)

    def test_invalid_json_checker():
        assert sj.is_valid_json('{"valid": true}') is True
        assert sj.is_valid_json('{"invalid": true,}') is False
        assert sj.is_valid_json(None) is False

    run_test("Unclosed Tag Failure", test_unclosed_tag, expected_success=False)
    run_test("is_valid_json Utility Check", test_invalid_json_checker)

    print("\n==================================================")
    print("             TESTING COMPLETE             ")
    print("==================================================")

if __name__ == "__main__":
    test_suite()