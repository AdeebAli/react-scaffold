# React Scaffold

A starting point for new client-side React + TypeScript apps. Clone it, rename it, delete the examples, and start building features. Linting, formatting, unit tests, e2e tests, Storybook, CI and a Docker image are already set up.

## Intentionally opinionated

This scaffold makes the common decisions up front so a new project doesn't have to. There is one way to fetch data, one place for routes, one test style and one folder layout. The goal is a codebase where any feature looks like every other feature.

- **Client-side rendered only.** No SSR, no meta-framework. The production build is static files served by nginx.
- **Server state lives in TanStack Query.** No `useEffect` fetching, and no copying query data into `useState`.
- **Shared client state uses React Context.** No Redux, Zustand or other state libraries.
- **Every response is validated with zod.** All HTTP calls go through one API client that requires a schema, so nothing untyped crosses the network boundary.
- **Behaviour tests only.** Tests render components, act like a user and assert on what's on screen. The network is mocked with MSW, never by stubbing `fetch`.
- **Strict TypeScript.** `strict: true`, no `any`, no enums.
- **npm only.** Conventional Commits are enforced with a git hook.

The full set of conventions is in [CLAUDE.md](./CLAUDE.md). It is written for both people and AI coding agents. Read it before adding code.

## Stack

| Area           | Choice                                                                        |
| -------------- | ----------------------------------------------------------------------------- |
| Runtime        | Node 24 (`.nvmrc`), npm                                                       |
| Build / dev    | [Vite](https://vite.dev)                                                      |
| UI             | [React](https://react.dev), client-side rendered                              |
| Language       | TypeScript (strict)                                                           |
| Routing        | [React Router](https://reactrouter.com) data router, lazy route chunks        |
| Server state   | [TanStack Query](https://tanstack.com/query)                                  |
| Validation     | [zod](https://zod.dev) at the API boundary and for env vars                   |
| Styling        | [Tailwind CSS v4](https://tailwindcss.com)                                    |
| Unit tests     | [Vitest](https://vitest.dev), React Testing Library, [MSW](https://mswjs.io)  |
| E2E tests      | [Playwright](https://playwright.dev) (Chromium)                               |
| Component docs | [Storybook](https://storybook.js.org)                                         |
| Lint / format  | ESLint (typescript-eslint type-checked), Prettier                             |
| Commits        | Husky + commitlint (Conventional Commits)                                     |
| Deploy         | Docker image: static build served by unprivileged nginx on port 8080          |
| Example API    | [JSONPlaceholder](https://jsonplaceholder.typicode.com), a free fake REST API |

## Getting started

```sh
nvm use                          # Node 24
npm install                      # also installs the git hooks
npm run dev                      # http://localhost:5173
```

The dev server calls the real API. To point it somewhere else, copy `.env.example` to `.env.local` and set `VITE_APP_API_URL`. It must be an origin with no path, such as `https://api.example.com`.

## Folder structure

The layout is inspired by [bulletproof-react](https://github.com/alan2207/bulletproof-react/tree/master/apps/react-vite). Code is grouped by feature, and dependencies flow one way: `app` → `features` → shared code. One change from bulletproof-react: endpoints live in `src/api/<resource>/`, grouped by API resource instead of by feature, so any feature can use any endpoint.

```
src/
  api/
    query-client.ts     # base query client: shared defaults and hook option types
  api/<resource>/       # server endpoints by API resource
    type.ts             # request/response schemas and types for the resource
    <endpoint>.ts       # request fn, query options, hook
  app/                  # app shell: providers, router, one <Name>Route.tsx per page
    routes/index.tsx    # the route table, shared by the app and tests
  components/
    layouts/            # MainLayout (nav + <Outlet />, focus on navigation), PageTitle
    ui/                 # shared presentational components, props only
  config/               # env.ts (zod-validated env), paths.ts (route paths + hrefs)
  features/<feature>/   # everything for one feature
    components/         # the feature's components, with __tests__/ and __stories__/
  hooks/                # shared hooks
  lib/                  # preconfigured libraries: api-client.ts (fetch + zod)
  testing/              # test-utils, MSW server and default handlers
  utils/                # shared pure helpers
e2e/tests/              # Playwright specs
nginx/default.conf      # production static serving
```

The main rules:

- Features don't import from other features. Pages in `app/routes/` compose them.
- Shared code (`api`, `components`, `config`, `hooks`, `lib`, `utils`) never imports from `features` or `app`.
- Code moves out of a feature into shared folders only once a second feature needs it.
- Tests and stories sit in `__tests__/` and `__stories__/` next to the file they cover.

## Starting a new app from this scaffold

### Rename

| File                 | Change                                                          |
| -------------------- | --------------------------------------------------------------- |
| `package.json`       | `name` (then run `npm install` to update the lockfile)          |
| `index.html`         | `<title>`                                                       |
| `public/favicon.svg` | Your icon                                                       |
| `README.md`          | Rewrite for your app                                            |
| `CLAUDE.md`          | Keep the conventions; update the title, API and layout sections |

### Point it at your API

| File                          | Change                                                     |
| ----------------------------- | ---------------------------------------------------------- |
| `src/config/env.ts`           | The `API_URL` default, plus any new `VITE_APP_*` variables |
| `src/vite-env.d.ts`           | Types for new env vars                                     |
| `.env.example`                | Document every env var                                     |
| `nginx/security-headers.conf` | Put your API origin in the CSP's `connect-src`             |

### Remove the examples

The `counter` (local state) and `users` (server state) features are there to show the patterns. Read them, then delete them:

- `src/features/counter/`, `src/features/users/` and `src/api/users/`
- `src/testing/mocks/handlers/users.ts`, and its entry in `handlers/index.ts`
- `src/app/routes/UsersRoute.tsx`, its route in `routes/index.tsx`, and `paths.users` in `src/config/paths.ts`
- The `Users` link in `src/components/layouts/MainLayout.tsx`
- The `Counter` in `src/app/routes/LandingRoute.tsx`
- The counter and users cases in `src/app/__tests__/AppRouter.test.tsx` and `e2e/tests/smoke.spec.ts`

Keep `src/lib/`, `src/testing/` (minus the users handlers), the layout, the 404 route and all the tooling config.

### Add a feature

1. Add the resource's request/response schemas and types to `src/api/<resource>/type.ts`, then one file per endpoint in the same folder, unless the resource already has it. Follow `src/api/users/get-users.ts` for queries and `create-user.ts` for mutations.
2. Create `src/features/<feature>/components/` and use the hooks from `src/api/`.
3. Add a default MSW handler in `src/testing/mocks/handlers/<resource>.ts` and register it in `index.ts`.
4. Add the page as `src/app/routes/<Name>Route.tsx` with a `<PageTitle title="…" />` and one `<h1>`, add its path to `src/config/paths.ts`, and register it lazily in `routes/index.tsx`.

## Commands

| Command                   | Purpose                                          |
| ------------------------- | ------------------------------------------------ |
| `npm run dev`             | Vite dev server                                  |
| `npm run build`           | Typecheck and production build into `dist/`      |
| `npm run preview`         | Serve the production build locally               |
| `npm run typecheck`       | `tsc -b` only                                    |
| `npm run lint`            | ESLint                                           |
| `npm run lint:fix`        | ESLint with autofix                              |
| `npm run format`          | Prettier: format all files                       |
| `npm run format:check`    | Prettier: check only                             |
| `npm test`                | Vitest in watch mode                             |
| `npm run test:run`        | Vitest single run                                |
| `npm run test:coverage`   | Single run with a coverage report in `coverage/` |
| `npm run test:e2e`        | Playwright e2e tests                             |
| `npm run storybook`       | Storybook on http://localhost:6006               |
| `npm run build-storybook` | Static Storybook build                           |

Before opening a PR, run:

```sh
npm run format && npm run typecheck && npm run lint && npm run test:run
```

## Testing

**Unit and component tests** use Vitest, React Testing Library and MSW in jsdom.

- Import `render`, `renderHook`, `renderApp`, `screen` and `userEvent` from `src/testing/test-utils`. Each render gets the app's providers and a fresh `QueryClient`.
- `renderApp(url)` renders the whole app with the real route table, for page and routing tests.
- Tests never hit the real API. Default MSW handlers live in `src/testing/mocks/handlers/`; override them per test with `server.use(...)`. Unhandled requests fail the test.
- Query by role and accessible name first. Assert on what the user sees, not on state or class names.

Run one folder or file with `npm run test:run -- src/features/users`.

**E2E tests** use Playwright against the real dev server and the real API. They cover critical flows such as navigation and pages loading data. Playwright starts the dev server on port 3000, or reuses one that's already running. First-time setup:

```sh
npx playwright install chromium
npm run test:e2e
```

**Storybook** documents components that render from props alone. Stories use CSF3 and sit in `__stories__/` next to the component.

## Building and deploying

`npm run build` writes static files to `dist/`. There is no Node server in production.

The Docker image builds the app on Node, then serves `dist/` with `nginx-unprivileged`, which runs as a non-root user on port **8080**:

```sh
docker build -t react-scaffold .
docker run -p 8080:8080 react-scaffold
```

`nginx/default.conf`:

- Serves `index.html` for extension-less paths, so client-side routes work on refresh.
- Returns 404 for missing files that have an extension.
- Caches `/assets/*` (fingerprinted by Vite) as immutable, and serves `index.html` with `no-cache` so new deploys are picked up.
- Gzips text responses.
- Sends security headers on every response (`nginx/security-headers.conf`): a strict Content-Security-Policy, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` and `Permissions-Policy`. The CSP's `connect-src` lists the API origin, so update it when you change the API.

`VITE_APP_*` variables are baked in at build time. `.env` files are excluded from the Docker build context, so the image uses the defaults in `src/config/env.ts`. Never put secrets in `VITE_APP_*` variables; they end up in the public bundle.

When you bump Node, update both `.nvmrc` and `NODE_VERSION` in the `Dockerfile`.

## CI

`.github/workflows/ci.yml` runs on pushes to `main` and on pull requests, with a read-only `GITHUB_TOKEN`:

- **ci:** `npm ci` → format check → lint → unit tests → build.
- **e2e:** `npm ci` → install Chromium → Playwright. On failure, the HTML report is uploaded as an artifact.

CI installs with `npm ci`, so `package-lock.json` must be committed and in sync. After adding dependencies on macOS, regenerate the lockfile from scratch so it includes Linux-only optional packages:

```sh
rm -rf node_modules package-lock.json && npm install
```

## Commits

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org), for example `feat(users): add search` or `fix: handle empty label`. A Husky `commit-msg` hook runs commitlint and rejects anything else.
