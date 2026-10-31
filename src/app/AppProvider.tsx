import { QueryClientProvider, type QueryClient } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { createQueryClient } from '../api/query-client'

type AppProviderProps = {
  children: ReactNode
  /** Override the QueryClient (tests pass one with retries off). */
  queryClient?: QueryClient
}

/** App-wide providers. Add context providers here. */
export function AppProvider({ children, queryClient }: AppProviderProps) {
  const [client] = useState(() => queryClient ?? createQueryClient())

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
