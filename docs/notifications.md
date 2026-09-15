# Notifications and Templates

Notification list and read actions operate on the authenticated user's notifications. Template and log operations require the relevant notification-management permission.

## Notifications

```http
GET    /api/v1/notifications?page=1&per_page=20&unread=true&type=payment
GET    /api/v1/notifications/unread-count
POST   /api/v1/notifications/read-all
GET    /api/v1/notifications/{notification}
POST   /api/v1/notifications/{notification}/read
POST   /api/v1/notifications/{notification}/unread
PUT    /api/v1/notifications/{notification}
PATCH  /api/v1/notifications/{notification}
DELETE /api/v1/notifications/{notification}
GET    /api/v1/notifications/{notification}/logs
```

Notification reads, unread-count responses, and list results are scoped to the current user. A notification ID must never be used to read another user's record.

## Templates

```http
GET    /api/v1/notification-templates
POST   /api/v1/notification-templates
GET    /api/v1/notification-templates/{notification_template}
PUT    /api/v1/notification-templates/{notification_template}
PATCH  /api/v1/notification-templates/{notification_template}
DELETE /api/v1/notification-templates/{notification_template}
```

Create fields are `name`, `notification_type`, `channel` (`email`, `push`, or `telegram`), `body`, and optional `subject` and `status`. Updates accept the same fields optionally. Template bodies use `{{variable_name}}` placeholders. The API validates supported variables and channels.
