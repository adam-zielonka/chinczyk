# Development

Use Node.js 24.22+ (24–26) and pnpm 12. The repository pins the verified package manager and runtime.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm audit --audit-level=high
pnpm test
```

Pull requests run validation without deploying. Pages deployment is restricted to
the default branch. Dependabot checks compatible updates weekly; major updates
are reviewed separately.

The build now uses Vite rather than Create React App. Existing React behavior
is retained. The old CRA service worker is retired within this app’s scope;
new deployments no longer promise offline caching.

The player-facing interface is in Polish. Opponent names and descriptions live in
`src/Game/PlayerProfiles.ts`; their internal IDs remain stable. Leon and Mila use
`PlayerStrategic`, with different weights for captures, progress, home entry and
opponent threats. The original five computer strategies remain selectable.

Tests cover strategic decisions, a complete seeded match, human turn controls,
empty seats, pause/resume and cancellation of queued turns when starting over.
