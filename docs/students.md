# Students

Student management requires the student-management permission and an authorized organization scope.

```http
GET    /api/v1/admin/students?page=1&per_page=20&search=andi&status=active
POST   /api/v1/admin/students
GET    /api/v1/admin/students/{student}
PUT    /api/v1/admin/students/{student}
PATCH  /api/v1/admin/students/{student}
DELETE /api/v1/admin/students/{student}
```

Create fields: `name`, `phone`, and optional `email`. Update fields are optional: `name`, `phone`, `email`, and `status` (`active`, `inactive`, or `suspended`). The API assigns ownership and organization relationships from server-side context. Clients must not send `user_type`, `payer_id`, ownership IDs, timestamps, or passwords unless a separate contract explicitly requires them.

List responses are paginated under `data`, with `search` and `status` filters. Deletion must follow the backend's retention policy; clients should treat a successful response as authoritative rather than assuming hard deletion.
