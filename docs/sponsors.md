# Sponsors

Sponsor management requires the sponsor-management permission and an authorized organization scope.

```http
GET    /api/v1/admin/sponsors?page=1&per_page=20&search=maya&status=active
POST   /api/v1/admin/sponsors
GET    /api/v1/admin/sponsors/{sponsor}
PUT    /api/v1/admin/sponsors/{sponsor}
PATCH  /api/v1/admin/sponsors/{sponsor}
DELETE /api/v1/admin/sponsors/{sponsor}
GET    /api/v1/admin/sponsors/{sponsor}/students
POST   /api/v1/admin/sponsors/{sponsor}/students
DELETE /api/v1/admin/sponsors/{sponsor}/students/{student}
```

Create fields are `name`, `phone`, and optional `email`. Update fields are optional and may include `status` (`active`, `inactive`, or `suspended`). Linking a student requires `student_id` and may include `relationship_type`. The API determines ownership and organization scope; clients must not submit payer or ownership fields.
