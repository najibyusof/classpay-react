# Architecture

`src/api` owns typed HTTP calls. `src/services` owns cross-cutting concerns such as secure tokens, payment creation, and native push delivery. `src/store` holds the minimal Zustand authentication session. Server data belongs in TanStack Query through screens and hooks.

`src/components` contains reusable presentational controls. `src/screens` is grouped by feature and role. `src/navigation` selects the authenticated role tree strictly from `authStore.user.user_type`; unsupported roles clear the session.

Student and sponsor data is fetched from separate authorized API paths. No client-side user, payer, or student ownership identifier is used to grant access.

React Query defaults cache data for five minutes, consider it stale after one minute, refetch after reconnect, and retry only retryable network/server failures once. Logout and `401` session loss clear the query cache to prevent cross-account stale data.
