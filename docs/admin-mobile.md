# Mobile Admin API

This is the implemented endpoint reference for the optional mobile Admin module. The complete backend admin endpoint inventory is in [admin.md](admin.md), with resource details in [organizations.md](organizations.md), [classes.md](classes.md), [payments.md](payments.md), and the other linked domain references. The module is mounted only for an authenticated `admin` role. Student and sponsor navigators do not import or expose it.

## Base URL and authentication

The mobile client prefixes every path below with the configured API base URL. The base URL must already end in `/api/v1`.

```text
GET {EXPO_PUBLIC_API_BASE_URL}/admin/dashboard
```

Every request requires the bearer token from the authenticated mobile session:

```http
Authorization: Bearer <access-token>
Accept: application/json
```

The client sends no organization ID as an authorization credential. The API must authorize the authenticated administrator on every request.

## Endpoint summary

| Endpoint                                            | Mobile use                                                 | Query parameters   |
| --------------------------------------------------- | ---------------------------------------------------------- | ------------------ |
| `GET /admin/dashboard`                              | Global admin dashboard and accessible organization summary | None               |
| `GET /admin/organizations`                          | Paginated accessible organization list                     | `page`, `per_page` |
| `GET /admin/organizations/{organization}`           | Selected organization details                              | None               |
| `GET /admin/organizations/{organization}/dashboard` | Dashboard for one authorized organization                  | None               |
| `GET /admin/payments`                               | Paginated payments visible to the administrator            | `page`             |
| `GET /admin/reports/payment-summary`                | Payment summary report                                     | None               |
| `GET /admin/reports/outstanding`                    | Outstanding payment report                                 | None               |
| `GET /admin/reports/overdue`                        | Overdue payment report                                     | None               |

`{organization}` is the organization ID returned by `GET /admin/organizations`. It is a route identifier only, not a permission grant.

## Common response and error rules

Successful responses may be returned either as the payload itself or inside a top-level `data` property for single-object dashboard and report endpoints. The mobile client accepts both forms.

For HTTP errors, return the normal Laravel status code and, where applicable, this validation shape:

```json
{
  "message": "The request could not be completed.",
  "errors": {
    "field": ["The field is invalid."]
  }
}
```

The mobile client handles `400`, `401`, `403`, `404`, `422`, `429`, and `5xx` responses. A `401` ends the mobile session; a `403` means the administrator is authenticated but lacks access. Do not return credentials, tokens, SQL errors, filesystem paths, or other sensitive implementation details in error messages.

## Endpoints

### Get global dashboard

```http
GET /admin/dashboard
```

Returns dashboard data for the authenticated administrator. The response must include an `organizations` value when organization access is represented by the dashboard. `organizations` may be an array of organization objects, a resource collection, or a numeric count. The client also recognizes these optional numeric count keys:

- `organization_count`
- `organizations_count`
- `total_organizations`

The remaining dashboard metrics are backend-defined and are rendered by their response keys. Example:

```json
{
  "data": {
    "organizations": [{ "id": 12, "name": "Padat School", "status": "active" }],
    "organization_count": 1,
    "total_students": 240
  }
}
```

### List accessible organizations

```http
GET /admin/organizations?page=1&per_page=20
```

Query parameters:

- `page`: positive page number. The mobile client starts at `1`.
- `per_page`: requested page size. The mobile client defaults to `20`.

Response:

```json
{
  "data": {
    "organizations": [
      {
        "id": 12,
        "name": "Padat School",
        "code": "PADAT",
        "description": "Padat School organization",
        "logo_path": null,
        "status": "active",
        "created_at": "2026-01-10T08:00:00Z",
        "updated_at": "2026-01-10T08:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 1,
      "per_page": 20,
      "total": 1
    }
  }
}
```

`id` may be a number or string. `code`, `description`, `logo_path`, `status`, `created_at`, and `updated_at` are optional and may be `null`.

### Get an organization

```http
GET /admin/organizations/{organization}
```

Returns one organization object. The object uses the same fields as an item in the organization list. The response may be bare or wrapped:

```json
{
  "data": {
    "id": 12,
    "name": "Padat School",
    "code": "PADAT",
    "status": "active"
  }
}
```

### Get an organization dashboard

```http
GET /admin/organizations/{organization}/dashboard
```

Returns dashboard metrics scoped to the requested organization. The response may be bare or wrapped in `data`. Metric names and values are backend-defined; scalar string and number values are displayed by the mobile client.

```json
{
  "data": {
    "active_students": 240,
    "outstanding_amount": 1250000,
    "overdue_payments": 8
  }
}
```

The API must verify active administrator access to this organization before returning any data.

### List payments

```http
GET /admin/payments?page=1
```

Query parameters:

- `page`: positive page number. The mobile client requests pages beginning at `1` and follows `current_page` and `last_page`.

Response:

```json
{
  "data": {
    "payments": [
      {
        "id": 501,
        "amount": 250000,
        "required_amount": 250000,
        "additional_infaq": 0,
        "total_amount": 250000,
        "currency": "IDR",
        "reference_number": "PAY-501",
        "payment_method": "bank_transfer",
        "paid_at": "2026-09-01T10:30:00Z",
        "created_at": "2026-09-01T10:00:00Z",
        "status": "paid",
        "class": { "id": 4, "name": "Class 4" },
        "payment_schedule": {
          "period_start": "2026-09-01",
          "period_end": "2026-09-30",
          "due_date": "2026-09-10"
        },
        "organization": {
          "id": 12,
          "name": "Padat School"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "last_page": 3
    }
  }
}
```

The payment `status` and `payment_method` values are backend-defined strings. `class` may be an object, string, or `null`; `organization` and optional payment fields may be absent or `null`.

### Get payment summary

```http
GET /admin/reports/payment-summary
```

Returns the backend-defined payment summary object. Scalar string and number properties are shown in the mobile report screen. The response may be bare or wrapped in `data`.

### Get outstanding payments report

```http
GET /admin/reports/outstanding
```

Returns the backend-defined outstanding payment report. The response may be bare or wrapped in `data`.

### Get overdue payments report

```http
GET /admin/reports/overdue
```

Returns the backend-defined overdue payment report. The response may be bare or wrapped in `data`.

The three report endpoints should return a JSON object. Their metric names are intentionally not prescribed by this mobile client; coordinate any new or renamed report fields with the mobile team before release.

## Authorization requirements

Laravel must enforce all of the following server-side:

- The request has an authenticated user with the `admin` role.
- The administrator can view every organization included in dashboard and organization-list responses.
- The administrator can view the organization identified in an organization detail or dashboard request.
- Every payment and report response is filtered to data the administrator is authorized to view.
- Access is rechecked after login, role changes, organization membership changes, and token refresh. A client-supplied organization ID must never bypass these checks.

## Backend endpoints not yet called by this app

The backend supports additional admin management endpoints documented in [admin.md](admin.md), but this mobile app currently performs no admin create, update, or delete request. Organization, student, sponsor, class, participant, RBAC, audit-log, notification-template, payment-proof, and device-management surfaces are either dormant UI or shared backend contracts. Do not add a mobile request solely because an endpoint appears in the inventory; implement and test the corresponding API service first.
