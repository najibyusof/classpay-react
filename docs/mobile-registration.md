# Mobile Registration

## Current backend capability

ClassPay currently has no documented public self-service mobile registration flow. Public signup entry points are not exposed in the mobile UI.

The one supported exception is the admin-initiated create-student flow: from a class's **Add Participants** screen, an authenticated administrator can open **Create New Student** (`src/screens/admin/CreateStudentScreen.tsx`). That screen calls `POST /api/v1/auth/register/student` with the student's name, phone, and optional email, a default password (`password` for both `password` and `password_confirmation`), and `device_name: '-'`. On success the new user is immediately added to the current class via `POST /api/v1/admin/classes/{class}/participants` and the participant list is refreshed.

All other account provisioning uses these backend endpoints:

- `POST /api/v1/admin/students`
- `POST /api/v1/admin/sponsors`

People with administrator-created accounts sign in using the existing `/api/v1/auth/login` flow.

## Mobile architecture

`src/registration/capabilities.ts` explicitly disables public registration for `student` and `sponsor`. It makes no HTTP requests and has no dependency on the API client. `RegistrationUnavailableNotice` is a reusable UI component for future entry points; it states the present limitation when passed a disabled capability.

The login screen intentionally contains no registration call to action, because displaying one would imply a currently unavailable feature.

## Future enablement

When the backend documents secure public registration contracts, add the endpoint-specific API service and form screen in a later phase. Update the matching capability only after its request, response, authentication, validation, and abuse-prevention requirements are documented and tested.

Public administrator registration must remain unsupported unless the backend introduces an explicitly documented secure admin-registration mechanism.
