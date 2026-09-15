# Notification Flow

The in-app notification module provides authenticated list, unread count, detail, read, unread, and read-all operations. The unread count is cached globally and displayed in the authenticated navigator header.

Native push support uses Expo Notifications with an Android channel, foreground presentation, response listeners, and a background task. A push response maps payment reminders/overdue events to schedules and payment success/failure/pending events to payment history. The destination still requires an authorized backend resource request.

Device token registration is intentionally pending until the backend documents the authenticated endpoint, payload, rotation, and revocation contract. See [mobile-push-notifications.md](mobile-push-notifications.md).
