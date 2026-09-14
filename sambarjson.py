import json
import re

def convert_sambarjson_to_json(sambarjson_str):
    # 1. Handle RAWSTRING: wraps inner text as a standard JSON string literal (escaped)
    string_pattern = re.compile(r'__RAWSTRINGSTART__(.*?)__RAWSTRINGFINSIH__', re.DOTALL)
    def escape_string(match):
        raw_text = match.group(1)
        if raw_text.startswith('\n'): raw_text = raw_text[1:]
        if raw_text.endswith('\n'): raw_text = raw_text[:-1]
        return json.dumps(raw_text)
    
    processed = string_pattern.sub(escape_string, sambarjson_str)

    # 2. Handle sambarjson: splices sambarJSON objects/arrays directly into the structure (no quotes)
    sambarjson_pattern = re.compile(r'__SAMBARJSONSTART__(.*?)__SAMBARJSONFINISH__', re.DOTALL)
    def splice_sambarjson(match):
        fragment = match.group(1).strip()
        return fragment
    
    processed = sambarjson_pattern.sub(splice_sambarjson, processed)

    # 3. Handle CLASSICJSON: treats inner content with explicit standard escaping rules
    classic_pattern = re.compile(r'__CLASSICJSONSTART__(.*?)__CLASSICJSONFINISH__', re.DOTALL)
    def handle_classic(match):
        classic_text = match.group(1).strip()
        return json.dumps(classic_text)
    
    processed = classic_pattern.sub(handle_classic, processed)

    # Final validation and clean formatting
    return json.dumps(json.loads(processed), indent=2)


def convert_json_to_sambarjson(json_str):
    data = json.loads(json_str)
    
    def custom_dump(obj, indent=2):
        dumped = json.dumps(obj, indent=indent)
        
        # Upgrade messy string literals to RAWSTRING blocks
        string_pattern = re.compile(r'"([^"\\]*(?:\\.[^"\\]*)*)"', re.DOTALL)
        def replace_with_raw(match):
            inner_content = match.group(1)
            unescaped = (inner_content
                         .replace(r'\"', '"')
                         .replace(r'\\', '\\')
                         .replace(r'\n', '\n')
                         .replace(r'\t', '\t')
                         .replace(r'\r', '\r'))
            
            if '\n' in unescaped or '"' in unescaped or '\\' in unescaped:
                return f"__RAWSTRINGSTART__\n{unescaped}\n__RAWSTRINGFINSIH__"
            return match.group(0)

        return string_pattern.sub(replace_with_raw, dumped)

    return custom_dump(data)

def is_valid_json(data: str) -> bool:
    """Returns True if the given string is valid JSON, False otherwise."""
    try:
        json.loads(data)
        return True
    except json.JSONDecodeError as e:
        print(f"JSON Error: {e}")
        return False
    except TypeError as e:
        print(f"Type Error: {e}")
        return False

def show_demo():
    __DEMO_sample_sambarjson = """
    {
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
        "inner_config":{"name": "Inner Config", "version": "A.1", "enabled": false}
      }
      __SAMBARJSONFINISH__
    }
    """
    print("--- sample sambarjson ---")
    print(__DEMO_sample_sambarjson)
    print("\n\n--- From sambarjson to regular JSON ---")
    converted_payload = convert_sambarjson_to_json(__DEMO_sample_sambarjson)
    print(converted_payload)
    print("is the converted payload a valid json?",is_valid_json(converted_payload))
