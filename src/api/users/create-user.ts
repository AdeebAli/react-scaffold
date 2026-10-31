import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiPost } from '../../lib/api-client'
import type { MutationConfig } from '../query-client'
import { getUsersQueryOptions } from './get-users'
import { CreateUserResponseSchema, type CreateUserInput } from './type'

export function createUser({ data }: { data: CreateUserInput }) {
  return apiPost('/users', CreateUserResponseSchema, { body: data })
}

type UseCreateUserOptions = {
  mutationConfig?: MutationConfig<typeof createUser>
}

/**
 * Creates a user, then updates the cached users list.
 *
 * @example
 * const createUser = useCreateUser()
 * createUser.mutate({ data: { name: 'Ada', email: 'ada@example.com' } })
 * // createUser.isPending / isError / error drive the UI
 */
export function useCreateUser({ mutationConfig }: UseCreateUserOptions = {}) {
  const queryClient = useQueryClient()
  const { onSuccess, ...restConfig } = mutationConfig ?? {}
  const usersQueryKey = getUsersQueryOptions().queryKey

  return useMutation({
    onSuccess: async (createdUser, ...args) => {
      // Show the new user right away instead of waiting for the refetch.
      queryClient.setQueryData(usersQueryKey, (users = []) => [
        ...users,
        createdUser,
      ])
      // Then refetch so the cache matches the server. Awaiting keeps the
      // mutation pending until the refetch finishes.
      await queryClient.invalidateQueries({ queryKey: usersQueryKey })
      await onSuccess?.(createdUser, ...args)
    },
    ...restConfig,
    mutationFn: createUser,
  })
}
