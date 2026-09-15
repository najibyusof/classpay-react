# Admin Reports

All report routes require `report.view` or the equivalent policy permission. Results are filtered to organizations and resources visible to the authenticated administrator.

## Payment summary

```http
GET /api/v1/admin/reports/payment-summary
```

Filters: `organization_id`, `class_id`, `from` or `date_from`, and `to` or `date_to`. Date filters use payment timestamps. The response contains backend-defined counts and financial totals.

## Outstanding and overdue

```http
GET /api/v1/admin/reports/outstanding
GET /api/v1/admin/reports/overdue
```

Filters: `organization_id`, `class_id`, `participant_id`, `student_id`, `from` or `date_from`, `to` or `date_to`, `page`, and `per_page`. These reports use payment schedule `due_date` for date filtering. `outstanding` includes unpaid and partially paid schedules; `overdue` includes schedules past their due date and may include days-overdue data.

Paginated report collections use `data.pagination`. Financial values are server-calculated decimal values; clients must not recompute totals from a partial page.
