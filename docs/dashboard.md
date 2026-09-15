# Admin Dashboards

Both dashboard endpoints require an authenticated administrator and apply organization policy before aggregating data.

## Endpoints

```http
GET /api/v1/admin/dashboard
GET /api/v1/admin/organizations/{organization}/dashboard
```

Supported query parameters are `from` or `date_from`, `to` or `date_to`, and `recent_limit` from `1` to `50` (default `10`). Date filters use `YYYY-MM-DD`.

The global response aggregates only organizations visible to the administrator. The organization response is scoped to `{organization}` and must recheck access server-side.

```json
{
  "success": true,
  "data": {
    "organization_count": 2,
    "total_students": 240,
    "outstanding_amount": "1250000.00",
    "recent_payments": []
  }
}
```

Metric names are backend-defined. Clients must tolerate additional fields and should not infer authorization from a returned count or ID. Dashboard date filters are applied consistently to the metric definitions supplied by the backend.
