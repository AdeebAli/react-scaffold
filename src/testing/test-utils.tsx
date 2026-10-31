import {
  render as rtlRender,
  renderHook as rtlRenderHook,
  type RenderHookOptions,
  type RenderOptions,
} from '@testing-library/react'
import type { ReactElement, ReactNode } from 'react'
import { createMemoryRouter, MemoryRouter, RouterProvider } from 'react-router'
import { AppProvider } from '../app/AppProvider'
import { routes } from '../app/routes'
import { createQueryClient } from '../api/query-client'

/** A fresh QueryClient per test so tests never share cache. */
function createTestQueryClient() {
  return createQueryClient({ queries: { retry: false } })
}

type RouteOptions = {
  /** Initial URL for the in-memory router. Defaults to `/`. */
  route?: string
}

function createWrapper({ route = '/' }: RouteOptions = {}) {
  const queryClient = createTestQueryClient()

  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AppProvider queryClient={queryClient}>
        <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
      </AppProvider>
    )
  }
}

/** Renders `ui` inside the app's providers and an in-memory router. */
export function render(
  ui: ReactElement,
  { route, ...options }: RouteOptions & Omit<RenderOptions, 'wrapper'> = {},
) {
  return rtlRender(ui, { wrapper: createWrapper({ route }), ...options })
}

/** Renders a hook inside the app's providers. Use for hooks with no UI of their own. */
export function renderHook<Result, Props>(
  hook: (props: Props) => Result,
  options?: Omit<RenderHookOptions<Props>, 'wrapper'>,
) {
  return rtlRenderHook(hook, { wrapper: createWrapper(), ...options })
}

/** Renders the whole app (real routes, layout, providers) at `url`. Use for routing and page-level tests. */
export function renderApp(url = '/') {
  const router = createMemoryRouter(routes, { initialEntries: [url] })

  return rtlRender(
    <AppProvider queryClient={createTestQueryClient()}>
      <RouterProvider router={router} />
    </AppProvider>,
  )
}

export { act, screen, within, waitFor } from '@testing-library/react'
export { userEvent } from '@testing-library/user-event'
