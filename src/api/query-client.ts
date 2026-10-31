import {
  QueryClient,
  type DefaultOptions,
  type UseMutationOptions,
} from '@tanstack/react-query'

/** Base query client config shared by every resource in src/api. */
export const queryConfig = {
  queries: {
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60,
  },
} satisfies DefaultOptions

/**
 * Creates the app's QueryClient with `queryConfig` defaults. `overrides` are
 * merged on top, e.g. tests pass `{ queries: { retry: false } }`.
 */
export function createQueryClient({
  queries,
  ...overrides
}: DefaultOptions = {}) {
  return new QueryClient({
    defaultOptions: {
      ...queryConfig,
      ...overrides,
      queries: { ...queryConfig.queries, ...queries },
    },
  })
}

type AsyncFn = (...args: never[]) => Promise<unknown>

type ApiFnReturnType<FnType extends AsyncFn> = Awaited<ReturnType<FnType>>

/** Extra `useQuery` options a query hook accepts, minus the parts it owns. */
export type QueryConfig<T extends (...args: never[]) => unknown> = Omit<
  ReturnType<T>,
  'queryKey' | 'queryFn'
>

/** `useMutation` options for a mutation hook, typed from its API function. */
export type MutationConfig<MutationFnType extends AsyncFn> = UseMutationOptions<
  ApiFnReturnType<MutationFnType>,
  Error,
  Parameters<MutationFnType>[0]
>
