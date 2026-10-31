import { queryOptions, useQuery } from '@tanstack/react-query'
import { apiGet } from '../../lib/api-client'
import type { QueryConfig } from '../query-client'
import { GetUsersResponseSchema } from './type'

export function getUsers({ signal }: { signal?: AbortSignal } = {}) {
  return apiGet('/users', GetUsersResponseSchema, { signal })
}

export function getUsersQueryOptions() {
  return queryOptions({
    queryKey: ['users'],
    queryFn: ({ signal }) => getUsers({ signal }),
  })
}

type UseUsersOptions = {
  queryConfig?: QueryConfig<typeof getUsersQueryOptions>
}

export function useUsers({ queryConfig }: UseUsersOptions = {}) {
  return useQuery({
    ...getUsersQueryOptions(),
    ...queryConfig,
  })
}
