# Mobile Push Notifications

## Current mobile architecture

The mobile client uses Expo Notifications, which provides native FCM tokens on Android and APNs tokens on iOS. `PushNotificationService` configures foreground notification presentation, Android notification channels, response listeners, and a module-scope background task for supported foreground, background, and terminated-app scenarios.

Remote notifications require a development or release build. Expo Go on Android does not support remote push notifications in SDK 57.

## Pending backend confirmation

The current backend contract does not document an authenticated device-token registration endpoint. `DeviceTokenService` can request a native Android/iOS device token but never logs, hard-codes, displays, or persists it. Its default `pendingDeviceTokenRegistrar` performs no network request.

When the backend publishes its contract, provide a `DeviceTokenRegistrar` implementation that posts the token, platform, authentication requirements, rotation policy, and revocation semantics exactly as documented. Do not invent a URL or request body.

## Push payload routing

`NotificationDeepLinkHandler` maps data payloads without trusting client-supplied ownership:

- `payment.reminder` and `payment.overdue` route to a payment schedule detail target when the backend supplies `payment_schedule_id`.
- `payment.success`, `payment.failed`, and `payment.pending` route to a payment detail target when the backend supplies `payment_id`.
- Class and system notifications, unknown types, or payloads without a resource ID route to the authenticated notification list.

The receiving screen must load the target through the existing authenticated API. A payload identifier never grants access to another user's payment or schedule.

On a cold or terminated launch, the destination is retained until the authenticated student or sponsor navigator is mounted. The navigator opens the matching authorized payment-schedules or payment-history area; a future nested detail route may consume the retained resource target after the existing authenticated detail-loading screens are promoted into navigation routes.
