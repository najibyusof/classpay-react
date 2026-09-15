# RBAC, Audit Logs, and Devices

RBAC management is normally restricted to system administrators. Audit data remains organization-scoped. Device routes operate on the current authenticated user's devices.

## Roles and permissions

```http
GET    /api/v1/roles
POST   /api/v1/roles
GET    /api/v1/roles/{role}
PUT    /api/v1/roles/{role}
PATCH  /api/v1/roles/{role}
DELETE /api/v1/roles/{role}
GET    /api/v1/permissions
POST   /api/v1/permissions
GET    /api/v1/permissions/{permission}
PUT    /api/v1/permissions/{permission}
PATCH  /api/v1/permissions/{permission}
DELETE /api/v1/permissions/{permission}
```

Role and permission creation requires `name` and may include `description`; update fields are optional. Do not assume that a role name grants access without the backend policy.

## Audit logs

```http
GET /api/v1/audit-logs
GET /api/v1/audit-logs/{audit_log}
```

The list supports pagination and available audit filters. Results must be scoped to the authenticated administrator's organizations.

## Devices

```http
GET    /api/v1/devices
POST   /api/v1/devices
GET    /api/v1/devices/{device}
PUT    /api/v1/devices/{device}
PATCH  /api/v1/devices/{device}
DELETE /api/v1/devices/{device}
```

Device registration and updates use the backend's device token and platform fields. The API must scope every device operation to the current user.

Legacy aliases remain available for compatibility:

```http
GET    /api/v1/user-devices
POST   /api/v1/user-devices
PUT    /api/v1/user-devices/{user_device}
PATCH  /api/v1/user-devices/{user_device}
DELETE /api/v1/user-devices/{user_device}
```

New mobile code should use `/devices`. Token rotation and revocation behavior must follow the backend contract.
