# API Response Standard

All endpoints use the `/api/v1` base path and return JSON unless an upload is explicitly documented as multipart.

## Success envelope

```json
{
  "success": true,
  "message": "Request completed.",
  "data": {}
}
```

`message` may be omitted for successful reads. `data` contains the resource, collection, or action result.

## Pagination

Paginated responses keep the collection and metadata inside `data`:

```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "current_page": 1,
      "last_page": 4,
      "per_page": 20,
      "total": 73
    }
  }
}
```

Clients must follow `current_page` and `last_page`; they must not calculate page counts locally. `per_page` defaults to `20` and must not exceed `100` unless the endpoint says otherwise.

## Validation and errors

```json
{
  "success": false,
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email field is required."]
  }
}
```

Use `401` for an absent or expired token, `403` for missing role or scope, `404` for an unavailable resource, `422` for validation or business rules, `429` for throttling, and `5xx` for server failures. Never expose tokens, passwords, SQL errors, or filesystem paths.

Money values are decimal strings or numbers according to the endpoint contract. Dates use `YYYY-MM-DD`; timestamps use ISO 8601.
