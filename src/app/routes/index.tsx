import type { RouteObject } from 'react-router'
import { MainLayout } from '../../components/layouts/MainLayout'
import { paths } from '../../config/paths'
import { ErrorRoute } from './ErrorRoute'

// Route modules are lazy-loaded so each page is its own chunk.
export const routes: RouteObject[] = [
  {
    element: <MainLayout />,
    // Shown while the first lazy route's code loads.
    hydrateFallbackElement: <p className="p-8 font-sans">Loading…</p>,
    // Last resort, for when the layout itself fails.
    errorElement: (
      <div className="p-8 font-sans">
        <ErrorRoute />
      </div>
    ),
    children: [
      {
        // Errors in a page render here, inside the layout, so the nav still works.
        errorElement: <ErrorRoute />,
        children: [
          {
            path: paths.home.path,
            lazy: () =>
              import('./LandingRoute').then((m) => ({
                Component: m.LandingRoute,
              })),
          },
          {
            path: paths.users.path,
            lazy: () =>
              import('./UsersRoute').then((m) => ({ Component: m.UsersRoute })),
          },
          {
            path: '*',
            lazy: () =>
              import('./NotFoundRoute').then((m) => ({
                Component: m.NotFoundRoute,
              })),
          },
        ],
      },
    ],
  },
]
