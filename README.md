# sambarJSON

Same JSON, but extended with support for raw strings and nested objects.

## Why use it

Writing multi-line text, code, SQL, HTML, or Windows paths in normal JSON means adding many backslashes.  
sambarJSON lets you write the text as-is.

## Markers

- `__RAWSTRINGSTART__` ... `__RAWSTRINGFINSIH__`  
  Text with no escaping needed.

- `__CLASSICJSONSTART__` ... `__CLASSICJSONFINISH__`  
  Text that still uses normal JSON escapes.

- `__SAMBARJSONSTART__` ... `__SAMBARJSONFINISH__`  
  A full object or array written in sambarJSON or normal JSON.

## Real example – SQL + error log + nested config

### Normal JSON (hard to read and edit)

```json
{
  "id": 505,
  "sql_query": "SELECT id, name, email\nFROM users\nWHERE status = \"active\"\n  AND created_at > \"2024-01-01\"\nORDER BY id DESC;",
  "error_log": "[ERROR] Failed to connect to db\nHost: localhost\nPath: C:\\Program Files\\App\\data\\db.sqlite\nMessage: \"Connection refused\"",
  "nested_config": {
    "db": {
      "host": "localhost",
      "port": 5432,
      "options": {
        "ssl": true,
        "timeout": 30
      }
    },
    "features": ["auth", "logging", "cache"]
  }
}
```

### Same data in sambarJSON (easier to write)

```txt
{
  "id": 505,
  "sql_query": __RAWSTRINGSTART__
SELECT id, name, email
FROM users
WHERE status = "active"
  AND created_at > "2024-01-01"
ORDER BY id DESC;
__RAWSTRINGFINSIH__,
  "error_log": __RAWSTRINGSTART__
[ERROR] Failed to connect to db
Host: localhost
Path: C:\Program Files\App\data\db.sqlite
Message: "Connection refused"
__RAWSTRINGFINSIH__,
  "nested_config": __SAMBARJSONSTART__
  {
    "db": {
      "host": "localhost",
      "port": 5432,
      "options": {
        "ssl": true,
        "timeout": 30
      }
    },
    "features": ["auth", "logging", "cache"]
  }
  __SAMBARJSONFINISH__
}
```

## HTML template example

### Normal JSON

```json
{
  "template": "<div class=\"user-card\">\n  <h1>Hello \"{{name}}\"</h1>\n  <p>Last login: {{last_login}}</p>\n  <script>\n    console.log(\"User loaded: \" + user.id);\n  </script>\n</div>"
}
```

### sambarJSON

```txt
{
  "template": __RAWSTRINGSTART__
<div class="user-card">
  <h1>Hello "{{name}}"</h1>
  <p>Last login: {{last_login}}</p>
  <script>
    console.log("User loaded: " + user.id);
  </script>
</div>
__RAWSTRINGFINSIH__
}
```

## Code snippet example

### Normal JSON

```json
{
  "python_code": "def process(data):\n    \"\"\"Handle input like {\"status\": \"ok\"}\"\"\"\n    path = r\"C:\\Users\\Admin\\data.json\"\n    print(f\"Reading from {path}\")\n    return data"
}
```

### sambarJSON

```txt
{
  "python_code": __RAWSTRINGSTART__
def process(data):
    """Handle input like {"status": "ok"}"""
    path = r"C:\Users\Admin\data.json"
    print(f"Reading from {path}")
    return data
__RAWSTRINGFINSIH__
}
```

## CLASSICJSON example

Use when you still want normal escaping:

```txt
{
  "version": __CLASSICJSONSTART__release-1.2.3\nbuild: "stable"__CLASSICJSONFINISH__,
  "warning": __CLASSICJSONSTART__File not found: "C:\temp\config.json"__CLASSICJSONFINISH__
}
```

Parsers are provided for each language along with demos. Below shown is the python example

## sambarJSON - Nesting and Object Support 

```python
>>> SAMBARJSON.show_demo()
--- sample sambarjson ---

    {
      "id": 505,
      "config_name": __CLASSICJSONSTART__{"name": "Standard Config", "version": "1.0", "enabled": true}__CLASSICJSONFINISH__,
      "payload": __RAWSTRINGSTART__
    <p>Hello "World"</p>
    C:\Users\Admin
    __RAWSTRINGFINSIH__,
      "embedded_tree": __SAMBARJSONSTART__
      {
        "sub_id": 99,
        "active": true,
        "tags": ["alpha", "beta"],
        "inner_config": __CLASSICJSONSTART__{"name": "Inner Config", "version": "A.1", "enabled": false}__CLASSICJSONFINISH__
      }
      __SAMBARJSONFINISH__
    }



--- From sambarjson to regular JSON ---
{
  "id": 505,
  "config_name": "{\"name\": \"Standard Config\", \"version\": \"1.0\", \"enabled\": true}",
  "payload": "    <p>Hello \"World\"</p>\n    C:\\Users\\Admin\n    ",
  "embedded_tree": {
    "sub_id": 99,
    "active": true,
    "tags": [
      "alpha",
      "beta"
    ],
    "inner_config": "{\"name\": \"Inner Config\", \"version\": \"A.1\", \"enabled\": false}"
  }
}

```

## Updates
Update 1 : To test the python parsing you can run the testing_sambarjson.py

Update 2 : I have also added javascript implementation you can test its parsing by opening testing_sambarjson.html in a browser
