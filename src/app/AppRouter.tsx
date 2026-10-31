import { useState } from 'react'
import { createBrowserRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { routes } from './routes'

export function AppRouter() {
  const [router] = useState(() => createBrowserRouter(routes))

  return <RouterProvider router={router} />
}
