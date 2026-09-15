# Organizations and Administrators

Organization management requires the relevant `organization.*` permission. Organization administrators may access only organizations with an active `organization_admins` assignment.

## Organization resources

```http
GET    /api/v1/admin/organizations?page=1&per_page=20&status=active&search=school
POST   /api/v1/admin/organizations
GET    /api/v1/admin/organizations/{organization}
PUT    /api/v1/admin/organizations/{organization}
PATCH  /api/v1/admin/organizations/{organization}
DELETE /api/v1/admin/organizations/{organization}
```

Create fields are `name`, optional `code`, `description`, and `status` (`active` or `inactive`). Update fields are optional. The creator becomes the primary active administrator when the organization is created. List responses are paginated.

## Organization administrators

```http
GET    /api/v1/admin/organizations/{organization}/admins
POST   /api/v1/admin/organizations/{organization}/admins
PUT    /api/v1/admin/organizations/{organization}/admins/{user}
PATCH  /api/v1/admin/organizations/{organization}/admins/{user}
DELETE /api/v1/admin/organizations/{organization}/admins/{user}
```

Create requires `user_id` and may accept `is_primary`. Updates may change `is_primary` and `status` (`active` or `inactive`). `{user}` is a user ID, not a pivot ID. The server must prevent removal or deactivation when it would violate organization access rules.
