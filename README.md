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

```json
{
  "version": __CLASSICJSONSTART__release-1.2.3\nbuild: "stable"__CLASSICJSONFINISH__,
  "warning": __CLASSICJSONSTART__File not found: "C:\temp\config.json"__CLASSICJSONFINISH__
}
```

## Nested object / array example

### Normal JSON

```json
{
  "pipeline": [
    {
      "step": "parse",
      "options": {
        "strict": true,
        "encoding": "utf-8"
      }
    },
    {
      "step": "validate",
      "rules": ["required", "type-check"]
    }
  ]
}
```

### sambarJSON

```txt
{
  "pipeline": __SAMBARJSONSTART__
  [
    {
      "step": "parse",
      "options": {
        "strict": true,
        "encoding": "utf-8"
      }
    },
    {
      "step": "validate",
      "rules": ["required", "type-check"]
    }
  ]
  __SAMBARJSONFINISH__
}
```
```
