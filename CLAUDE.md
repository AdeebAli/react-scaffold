# React Scaffold

Client-side rendered React + TypeScript app built with Vite. Starting point for new front-end projects. The folder structure follows [bulletproof-react](https://github.com/alan2207/bulletproof-react/tree/master/apps/react-vite), adapted to the conventions below.

## Stack

- **Node:** 24 (`.nvmrc`). CI reads `.nvmrc`. The `Dockerfile` has its own `NODE_VERSION` arg, so update both together.
- **Package manager:** npm only. Always commit `package-lock.json`, since CI and Docker install with `npm ci`, which requires it. Don't use yarn, pnpm, or bun, and don't commit their lockfiles.
- **Build/dev:** Vite (`vite.config.ts`).
- **UI:** plain React, client-side rendered. No SSR and no meta-framework (Next.js, Remix, etc.).
- **Routing:** React Router (`react-router`), data router with lazy-loaded route modules.
- **Language:** TypeScript, `strict: true` (`tsconfig.app.json`, `tsconfig.node.json`). Pinned to `~6.0` because typescript-eslint doesn't support TS 7 yet. Don't bump it until typescript-eslint does.
- **Server state:** TanStack Query (`@tanstack/react-query`).
- **Shared client state:** React Context. No Redux, Zustand, or other state libraries.
- **API:** [JSONPlaceholder](https://jsonplaceholder.typicode.com) (a free fake REST API) by default, called directly from the browser. Responses are validated with zod.
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite` (`src/index.css` holds `@import 'tailwindcss'`).
- **Unit/component tests:** Vitest (`globals: true`) + React Testing Library + `@testing-library/user-event` + `@testing-library/jest-dom` + MSW (Node only), jsdom environment. Coverage via `@vitest/coverage-v8`.
- **E2E tests:** Playwright (`playwright.config.ts`, tests in `e2e/`), Chromium.
- **Components workshop:** Storybook (`.storybook/`), React + Vite framework.
- **Lint:** ESLint flat config (`eslint.config.js`): typescript-eslint `recommendedTypeChecked`, react-hooks, react-refresh, storybook, playwright (for `e2e/`), then `eslint-config-prettier`.
- **Formatting:** Prettier (`.prettierrc`): no semicolons, single quotes, trailing commas, width 80.
- **Commits:** Conventional Commits, enforced by commitlint (`commitlint.config.js`) in a Husky `commit-msg` hook (`.husky/commit-msg`).

## Commands

| Command                                  | Purpose                                                        |
| ---------------------------------------- | -------------------------------------------------------------- |
| `npm install`                            | Install dependencies                                           |
| `npm run dev`                            | Start Vite dev server (calls the real API)                     |
| `npm run build`                          | Typecheck and production build                                 |
| `npm run typecheck`                      | `tsc -b` only                                                  |
| `npm test`                               | Vitest in watch mode                                           |
| `npm run test:run`                       | Vitest single run (CI). Use this for verification              |
| `npm run test:run -- src/features/users` | Run one folder or file                                         |
| `npm run test:coverage`                  | Single run with coverage report (text + `coverage/index.html`) |
| `npm run test:e2e`                       | Playwright e2e tests (starts the dev server on port 3000)      |
| `npm run lint`                           | ESLint                                                         |
| `npm run lint:fix`                       | ESLint with autofix                                            |
| `npm run format`                         | Prettier: format all files                                     |
| `npm run format:check`                   | Prettier: check only (CI)                                      |
| `npm run storybook`                      | Storybook on http://localhost:6006                             |
| `npm run build-storybook`                | Static Storybook build                                         |

Before calling work done, run: `npm run format && npm run typecheck && npm run lint && npm run test:run`. Run `npm run test:e2e` too when a change affects routing or a user flow.

First-time Playwright setup: `npx playwright install chromium`.

## CI and deployment

- **CI:** `.github/workflows/ci.yml` runs on pushes to `main` and on PRs.
  - `ci` job: `npm ci` → `format:check` → lint → unit tests → build.
  - `e2e` job: `npm ci` → install Chromium → `test:e2e`. On failure it uploads `playwright-report/` as an artifact.
- **Serving:** nginx (`nginx/default.conf`) serves the static `dist/` build. Extension-less paths fall back to `index.html` (client-side routes), and missing files that have an extension return 404. `/assets/*` is cached as immutable, `index.html` is `no-cache`, and responses are gzipped. Every response gets the security headers in `nginx/security-headers.conf` (CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`). nginx drops server-level `add_header` in any location that sets its own, so any location that uses `add_header` must also `include` that file. There is no Node server in production.
- **Docker:** multi-stage `Dockerfile`. The build stage runs `npm ci` and `npm run build` on Node. The runtime stage is `nginxinc/nginx-unprivileged`, pinned to a version (e.g. `1.31.7-alpine`) so builds are reproducible. Bump it deliberately. It runs as non-root, listens on **8080**, and contains only `dist/` and the nginx config. `.env` files are excluded from the build context, so the image uses the defaults in `src/config/env.ts`.
  `docker build -t react-scaffold . && docker run -p 8080:8080 react-scaffold`
- **Lockfile:** CI and Docker use `npm ci` on Linux. Adding dependencies on macOS often leaves Linux-only optional packages out of the lockfile, and then `npm ci` fails with "Missing: … from lock file". After adding dependencies, regenerate the lockfile from scratch with `rm -rf node_modules package-lock.json && npm install` (npm/cli#4828).

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/): `<type>(<optional scope>): <subject>`.
The Husky `commit-msg` hook rejects messages that don't follow this format. Don't bypass it with `--no-verify`.

- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Subject: imperative, lowercase, no trailing period, header ≤ 100 chars.
- Breaking changes: `feat!: ...` or a `BREAKING CHANGE:` footer.
- Examples: `feat(counter): add reset button`, `fix: handle empty label`, `chore(deps): bump vite`.

Husky installs itself through the `prepare` script on `npm install`.

## Project layout

```
src/
  main.tsx                       # entry: mounts <App />
  index.css                      # Tailwind entry
  vite-env.d.ts                  # types for VITE_APP_* env vars
  api/                           # server state
    query-client.ts              # base query client: queryConfig, createQueryClient, QueryConfig/MutationConfig types
  api/<resource>/                # server endpoints, one folder per API resource
    type.ts                      #   the resource's request/response schemas and types
    <endpoint>.ts                #   request fn, query options, hook
    __tests__/
  api/users/                     # example resource
    type.ts                      #   UserSchema/User, request + response schemas and types
    get-users.ts                 #   getUsers, getUsersQueryOptions, useUsers
    create-user.ts               #   createUser, useCreateUser
    __tests__/create-user.test.tsx
  app/                           # app shell
    App.tsx                      # <AppProvider><AppRouter /></AppProvider>
    AppProvider.tsx              # app-wide providers (QueryClientProvider, context providers)
    AppRouter.tsx                # createBrowserRouter(routes)
    routes/
      index.tsx                  # route table (lazy route modules, layout, 404)
      LandingRoute.tsx           # one component per page
      UsersRoute.tsx
      NotFoundRoute.tsx
      ErrorRoute.tsx             # errorElement for route errors (not lazy)
    __tests__/AppRouter.test.tsx # routing tests via renderApp()
  components/
    layouts/MainLayout.tsx       # nav + <Outlet />; moves focus to the new page's <h1> on navigation
    layouts/PageTitle.tsx        # <PageTitle title="Users" /> sets the document title
    ui/                          # shared presentational components, no business logic (empty for now)
  config/
    env.ts                       # zod-validated env (VITE_APP_*)
    paths.ts                     # route paths + getHref() helpers
  features/<feature>/
    components/                  # the feature's components, with __tests__/ and __stories__/
    hooks/, types/, utils/       # only when the feature needs them
  features/counter/              # example: local state
    components/Counter.tsx
    components/__stories__/Counter.stories.tsx
    components/__tests__/Counter.test.tsx
  features/users/                # example: server state (React Query + zod)
    components/UserList.tsx
    components/__tests__/UserList.test.tsx
  hooks/                         # shared hooks
    useFocusOnRouteChange.ts     # focus management after client-side navigation
  lib/                           # preconfigured libraries
    api-client.ts                # apiGet/Post/Put/Patch/Delete: fetch + zod validation
    __tests__/api-client.test.ts
  testing/                       # unit/component test infrastructure (never imported by app code)
    setup-tests.ts               # jest-dom matchers, MSW server lifecycle
    test-utils.tsx               # render / renderHook / renderApp + RTL re-exports
    mocks/server.ts              # MSW Node server
    mocks/handlers/index.ts      # combines per-resource handlers
    mocks/handlers/users.ts
  utils/                         # shared pure helpers
e2e/tests/*.spec.ts              # Playwright tests
playwright.config.ts
nginx/default.conf               # production static serving config
```

- Feature-specific code goes in `src/features/<feature>/`. Move it to `api`, `components/ui`, `hooks`, `lib` or `utils` only once a second feature needs it.
- Features don't import from other features. Compose features in `app/routes/`.
- Dependencies flow one way: `app` → `features` → shared (`api`, `components`, `config`, `hooks`, `lib`, `utils`). Shared code never imports from `features` or `app`.
- `components/ui` components take data through props. They never fetch or read feature state.
- Server endpoints live in `src/api/<resource>/`, never in a feature. Features call the hooks from there.
- Use relative imports. There is no path alias.

### File naming

- Files that export a component or a hook are PascalCase/camelCase and match the export: `UserList.tsx`, `MainLayout.tsx`, `LandingRoute.tsx`, `useDisclosure.ts`.
- Everything else uses kebab-case, as in bulletproof-react: `get-users.ts`, `create-user.ts`, `type.ts`, `api-client.ts`, `query-client.ts`, `test-utils.tsx`.
- Tests and stories live in `__tests__/` and `__stories__/` next to the file and keep its name: `UserList.tsx` → `__tests__/UserList.test.tsx`.

## TypeScript conventions

- Strict mode stays on. Don't weaken compiler options to get something to compile.
- No `any`. Use `unknown` and narrow it. Avoid `as` casts and the non-null `!` unless the invariant is obvious.
- Name props types `<Component>Props` and export them next to the component:
  `export type ButtonProps = { ... }`.
- Use `type` for props and object shapes. Use `interface` only when you need declaration merging.
- Don't use `@ts-ignore`. If it can't be avoided, use `@ts-expect-error` with a comment explaining why.
- Type props explicitly, not with `React.FC`. Let return types be inferred for components.
- Use `import type` for type-only imports (`verbatimModuleSyntax` is on).
- Model variants as string-literal unions (`'primary' | 'secondary'`), not enums (`erasableSyntaxOnly` is on).
- Optional props get defaults via destructuring: `({ step = 1 }: CounterProps)`.
- To type props with API data, `import type` the inferred type from `src/api/<resource>/type.ts` (`user: User`). Never re-declare an API shape in a component.
  - Use `Pick<User, 'name' | 'email'>` when the component reads only some fields, and `User['id']` for a single field.
  - `components/ui` never imports API types. Give it its own props (`{ name: string }`) and let features pass API data in.

## Component conventions

- Small, functional components only. No class components.
- One component per file. Use named exports (`export function Counter`), not default exports. Storybook `meta` is the one default export.
- Keep a component focused on one job. If it grows a second job or gets long, split it into smaller components.
- Keep state as local as possible. Derive values during render instead of syncing them with `useEffect`.
- Don't use `useEffect` for data fetching. Use a TanStack Query hook.
- Move reusable logic into custom hooks (`useSomething`) in the feature's `hooks/` or `src/hooks/`.
- Use semantic HTML and accessible names (real `<button>`, a `<label>` for every input, roles where needed). This also makes components easy to test by role.
- Never put `onClick` on a `div` or `span`. Use a `<button>`.
- Every `components/ui` component, and every feature component that renders from props alone, has a story covering its main states/variants.

## Routing

- Routes are defined once in `src/app/routes/index.tsx` and shared by the app (`createBrowserRouter`) and tests (`createMemoryRouter` in `renderApp`).
- Each page is a `<Name>Route.tsx` component in `src/app/routes/`, loaded with `lazy` so it gets its own chunk. Route components compose features; they hold little logic themselves.
- Every route component (including `NotFoundRoute` and `ErrorRoute`) renders `<PageTitle title="…" />` and exactly one `<h1>`. `PageTitle` adds the app name, and React 19 moves the `<title>` into `<head>`. After a client-side navigation, `MainLayout` moves focus to the new page's `<h1>` so keyboard and screen reader users land on the new content.
- All pages render inside `MainLayout` (`<Outlet />`). Unknown URLs hit the `*` route (`NotFoundRoute`).
- Route errors (a page that throws while rendering, or a page chunk that fails to load) render `ErrorRoute`. Pages sit in a pathless route with its own `errorElement`, so the error shows inside the layout and the nav keeps working. The layout route has a last-resort `errorElement` too. Add new pages inside that pathless route. Keep `ErrorRoute` eagerly imported so it renders when chunks fail.
- Error boundaries don't catch failed queries. Handle those inline with the query's `isError` state (see `UserList`).
- Never hard-code URLs. Add the route to `src/config/paths.ts` and use `paths.x.path` in the route table and `paths.x.getHref()` in links. Each entry must satisfy `AppPath` (`path` plus `getHref`). Routes with params take them in `getHref` and encode them: ``getHref: (userId: string) => `/users/${encodeURIComponent(userId)}` ``.
- Use `<Link>`/`<NavLink>` for navigation, not `<a href>` or `window.location`.

## Data and state

- **Server state:** TanStack Query. One file per endpoint in `src/api/<resource>/`, grouped by API resource (not by feature) so any feature can use any endpoint. The file pattern follows bulletproof-react:
  - `getX()`: the request function (calls the API client).
  - `getXQueryOptions()`: `queryOptions({ queryKey, queryFn })`. This is the one place the query key is defined. Everything else (invalidation, `setQueryData`, prefetching) reads `getXQueryOptions().queryKey`.
  - `useX({ queryConfig })`: the hook. It spreads the options and accepts extra options typed with `QueryConfig<typeof getXQueryOptions>` from `src/api/query-client.ts`.
  - See `src/api/users/get-users.ts`.
- **Mutations:** same file pattern (`create-user.ts`): the request function and `useCreateX({ mutationConfig })` typed with `MutationConfig<typeof createX>`. In `onSuccess`, use `useQueryClient()` to update the cache (`setQueryData`) and/or invalidate the affected query keys, then call the caller's `onSuccess`. Await the invalidation so the mutation stays pending until the refetch finishes. See `src/api/users/create-user.ts`.
- Global query defaults live in `queryConfig` (`src/api/query-client.ts`): no refetch on window focus, 1-minute `staleTime`. Create clients only with `createQueryClient()` so the app and tests share them.
- Hooks (`useX`, `useCreateX`) live in their endpoint file in `src/api/<resource>/`, not in `src/hooks/`. That keeps each hook next to the query key and request function it wraps, and features import everything for an endpoint from one place.
- Don't copy query data into `useState`.
- **Shared client state:** React Context for state several components need (theme, current user, UI preferences). Write a provider plus a `useX()` hook that throws if used outside the provider. Mount app-wide providers in `src/app/AppProvider.tsx`. Keep everything else in local `useState`/`useReducer`.
- Don't add Redux, Zustand, or other state libraries.

## API boundary (zod)

- All HTTP calls go through `src/lib/api-client.ts`: `apiGet`, `apiPost`, `apiPut`, `apiPatch`, `apiDelete` (or `apiRequest(method, …)`). Never call `fetch` directly. Each one requires a zod schema and parses the response, so nothing untyped crosses the network boundary.
- Signature: `apiX(path, schema, { params, body, signal })`. Paths are relative to `env.API_URL` (e.g. `'/users'`). A path that resolves to another origin (`//other.example`, `https://…`) throws before any request is sent. `body` is sent as JSON with `Content-Type: application/json`. `apiGet` takes no body. Non-2xx responses, and 2xx responses whose body isn't JSON, throw `ApiError` (with `.status`).
- Empty responses (e.g. 204) parse as `undefined`, so pass `z.undefined()` as the schema: ``apiDelete(`/users/${id}`, z.undefined())``.
- Always pass React Query's `signal` through to the request so stale or unmounted queries cancel it: `queryFn: ({ signal }) => getUsers({ signal })`.
- Pass query params through the `params` option, never by building query strings by hand: `apiGet('/users', UsersSchema, { params: { search, page } })`. Values are URL-encoded, `null`/`undefined` are skipped, and arrays become repeated keys (`?id=1&id=2`). Include the params in the query key: `['users', { search, page }]`.
- Encode dynamic path segments: ``apiGet(`/users/${encodeURIComponent(id)}`, UserSchema)``.
- Each resource's request and response types live in `src/api/<resource>/type.ts`: the entity schema (`UserSchema`), each endpoint's input schema (`createUserInputSchema`) and response schema (`GetUsersResponseSchema`), with every type inferred from its schema: `export type User = z.infer<typeof UserSchema>`. Endpoint files import schemas from there and pass the response schema to the API client. Another resource that needs an entity imports it from that resource's `type.ts`. Don't hand-write types that duplicate a schema. zod strips fields that aren't in the schema, so only declare what the app uses.
- A response that fails validation throws, and the query surfaces it as an error state.
- JSONPlaceholder accepts writes (POST/PUT/PATCH/DELETE) but doesn't persist them. A refetch after a create returns the original data.

## Environment variables

- App env vars are prefixed `VITE_APP_` and read only through `src/config/env.ts`, which validates them with zod and fails fast on invalid values. Never read `import.meta.env` elsewhere, and never `process.env`.
- To add one: declare it in `src/vite-env.d.ts`, add it to the schema in `env.ts`, and document it in `.env.example`.
- `VITE_APP_API_URL`: API origin. Defaults to `https://jsonplaceholder.typicode.com`. Override in `.env.local`. When you change the production API origin, update the default in `env.ts` and `connect-src` in `nginx/security-headers.conf` together, or the CSP blocks every API call.
- Never put secrets in `VITE_APP_*` variables: they are inlined into the public bundle. `.env` and `.env.*` are gitignored (except `.env.example`).

## Styling (Tailwind)

- Style with Tailwind utility classes in `className`. Don't use CSS files per component, CSS-in-JS, or inline `style` objects, except for truly dynamic values (e.g. a computed width).
- When a component repeats the same class list, put it in a constant (see `buttonClasses` in `src/features/counter/components/Counter.tsx`) or extract a component.
- Include `focus-visible:` styles on interactive elements.

## Formatting

- Prettier owns formatting. Don't hand-format or argue with it, and don't add ESLint style rules (`eslint-config-prettier` turns conflicting ones off).
- Run `npm run format` before committing. CI fails on unformatted files (`format:check`).

## Testing conventions

Write **behavior tests**: test what the user sees and does, not how the component works inside.

- Put tests in a `__tests__/` folder in the same directory as the file under test, named after that file: `src/app/AppRouter.tsx` → `src/app/__tests__/AppRouter.test.tsx`, `src/features/users/components/UserCard.tsx` → `src/features/users/components/__tests__/UserCard.test.tsx`. Never put a `*.test.ts(x)` file directly next to the source. Stories follow the same pattern in `__stories__/` (see Storybook conventions).
- Import `render`, `renderHook`, `renderApp`, `screen` and `userEvent` from `src/testing/test-utils`, not from `@testing-library/react`. Each call gets a fresh `QueryClient` (`createQueryClient()` with `retry: false`).
  - `render(ui, { route })`: a component inside the app's providers and a `MemoryRouter` at `route` (default `/`).
  - `renderHook(hook)`: hooks with no UI of their own. Assert on the results the hook exposes, not its internals.
  - `renderApp(url)`: the whole app (real route table, layout, lazy routes) at `url`. Use for routing and page-level tests.
- React Query updates arrive after `act()` returns, so assert with `waitFor`/`findBy*`.
- Vitest `globals: true` is on, so `describe`/`it`/`expect`/`beforeEach`/`vi` need no imports.
- Render the component, act like a user with `userEvent`, and assert on what is on screen.
- Query in this priority order: `getByRole` (with `name`) → `getByLabelText` → `getByPlaceholderText` → `getByText` → `getByDisplayValue` → `getByAltText`/`getByTitle`. Use `getByTestId` only as a last resort.
- Use `userEvent.setup()` and `await user.click(...)`/`user.type(...)`. Prefer this over `fireEvent`.
- Use `findBy*` / `waitFor` for async UI; don't add manual timeouts.
- Assert with jest-dom matchers (`toBeInTheDocument`, `toHaveTextContent`, `toBeDisabled`, …).
- Name tests after behavior: `it('shows an error when the email is invalid')`.
- Unit and component tests never hit the real API. Mock the network with MSW, never by stubbing `fetch` or the API client. Default handlers live in `src/testing/mocks/handlers/` (one file per resource, combined in `index.ts`). Override them per test with `server.use(...)`, and they reset after each test. Unhandled requests fail the test. Use `*/path` patterns so handlers match whatever `API_URL` is. When you add an endpoint, add a default handler for it.
- Use `vi.mock` only for true external boundaries, such as analytics or browser APIs jsdom lacks. Never mock the component under test or its children just to isolate them.
- Each test sets up its own data. No shared mutable state between tests.
- Write a failing test that reproduces a bug before you fix it.

**Do not:**

- Assert on internal state, hook return values, or instance methods.
- Assert on class names, inline styles, or DOM structure unless that's the user-visible contract.
- Spy on `useState`/`useEffect` or test that a specific internal function was called.
- Use snapshot tests as the main assertion.

A test should still pass after a refactor that leaves behavior unchanged. Reference patterns:

- `src/features/counter/components/__tests__/Counter.test.tsx`: interaction.
- `src/features/users/components/__tests__/UserList.test.tsx`: data fetching with MSW.
- `src/api/users/__tests__/create-user.test.tsx`: mutation hook with a per-test fake API.
- `src/app/__tests__/AppRouter.test.tsx`: routing with `renderApp`.

## E2E tests (Playwright)

- Tests live in `e2e/tests/*.spec.ts`. Playwright starts the dev server on port 3000 (`webServer` in `playwright.config.ts`) and reuses one that's already running locally.
- E2E tests run against the real app and the real API (JSONPlaceholder). Cover critical user flows end to end (navigation, pages loading data, key interactions), not every edge case. Edge cases belong in component tests.
- Don't assert on exact API data that could change. Assert on structure and behavior (e.g. "the users list has items").
- Use the same accessible locators as RTL: `getByRole` with `name` first, `getByTestId` last. Scope with `getByRole('navigation', { name: 'Main' })` etc. when names repeat.
- Use web-first assertions (`await expect(locator).toBeVisible()`, `toHaveURL`, `toHaveText`). Never use `page.waitForTimeout`.
- E2E tests don't import from `src/`.
- ESLint applies `eslint-plugin-playwright` rules to `e2e/`.

## Storybook conventions

- Put stories in a `__stories__/` folder in the same directory as the component, named after it: `src/features/counter/components/Counter.tsx` → `src/features/counter/components/__stories__/Counter.stories.tsx`. Never put a `*.stories.tsx` file directly next to the source.
- Use CSF3 with `satisfies Meta<typeof Component>` and `StoryObj<typeof meta>`.
- Set shared defaults in `meta.args` and override per story.
- Title format: `Components/<Name>` for `components/ui`, `Features/<Name>` for feature components.

## Workflow

- Keep diffs scoped. Don't refactor unrelated code or reformat untouched files.
- Don't add dependencies without asking.
- Don't edit generated files (e.g. `src/lib/api/generated/`, `*.gen.ts`).
