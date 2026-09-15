# API Integration

All requests use the Axios client configured with `EXPO_PUBLIC_API_BASE_URL`. The value must include `/api/v1`. A SecureStore-backed bearer token is attached by the request interceptor.

Responses and failures are normalized through `ApiError`. The client presents fixed safe messages for HTTP `400`, `401`, `403`, `404`, `422`, `429`, and `5xx` responses. Validation errors remain available as `fieldErrors` for React Hook Form. Raw exception strings, SQL errors, credentials, paths, and tokens are not displayed.

React Query owns server caching. Payment creation invalidates payment schedules and payment history only after a backend response. Notification read/unread mutations use optimistic cache updates with rollback, then reconcile with the backend.

Resource identifiers in schedule, payment, and notification paths do not establish authorization. Laravel must validate authenticated ownership for every resource request.

## Browser CORS

The React Native web target sends requests from its browser origin. The Laravel API must allow the exact development and production web origins in `config/cors.php`, including the `/api/*` paths and the `OPTIONS` preflight method. Bearer-token authentication does not require cookie credentials.

Example development origins:

- `http://localhost:8088`
- `http://127.0.0.1:8088`

Add the deployed web origin for production. After changing Laravel CORS configuration, clear the backend configuration cache and restart the API server. A browser CORS failure appears to Axios as a network error even when the API itself is reachable.
