# ClassPay Mobile

ClassPay is an Expo 57 React Native application for students and sponsors to view payment obligations, create payment attempts, review payment history, and receive authenticated notifications.

## Prerequisites

- Node.js LTS
- An Android or iOS development build for remote push notifications
- A Laravel API URL ending in `/api/v1`

## Setup

1. Copy the appropriate environment template to `.env.local`.
2. Set `EXPO_PUBLIC_API_BASE_URL` to the target Laravel API base URL.
3. Run `npm install`.
4. Run `npm start`.

Available commands: `npm test -- --runInBand`, `npm run typecheck`, `npm run lint`, and `npm run format:check`.

When testing on a physical Android or iOS device, do not use `localhost`: it refers to the phone. Start Laravel so it listens on your computer's network interface, then set the URL to its LAN address, for example `http://192.168.68.111:8000/api/v1`.

## Environments

Use `.env.development.example`, `.env.staging.example`, or `.env.production.example` as non-secret templates. `eas.json` supplies build profile names, while each build environment must provide its own `EXPO_PUBLIC_API_BASE_URL`. API URLs are public configuration, but access tokens and device tokens must never be added to environment files.

## Documentation

- [Architecture](docs/architecture.md)
- [API integration](docs/api-integration.md)
- [Mobile admin API](docs/admin-mobile.md)
- [Admin API endpoint inventory](docs/admin.md)
- [API response standard](docs/response-standard.md)
- [Authentication](docs/authentication.md)
- [Payment flow](docs/payment-flow.md)
- [Notification flow](docs/notification-flow.md)
- [Mobile registration](docs/mobile-registration.md)

## Release Prerequisites

Before production release, configure the documented backend device-token registration contract and the Android FCM/iOS APNs credentials. The mobile client deliberately has no guessed device-registration endpoint.
