import { http, HttpResponse } from 'msw'
import { server } from '../../../testing/mocks/server'
import { act, renderHook, waitFor } from '../../../testing/test-utils'
import { useCreateUser } from '../create-user'
import { useUsers } from '../get-users'
import { createUserInputSchema, type User } from '../type'

// A tiny fake backend for one test: the list and POST share the same array.
function useFakeUsersApi(users: User[]) {
  server.use(
    http.get('*/users', () => HttpResponse.json(users)),
    http.post('*/users', async ({ request }) => {
      const created = {
        id: users.length + 1,
        ...createUserInputSchema.parse(await request.json()),
      }
      users.push(created)
      return HttpResponse.json(created, { status: 201 })
    }),
  )
}

function renderUsersAndCreate() {
  return renderHook(() => ({
    users: useUsers(),
    createUser: useCreateUser(),
  }))
}

const ada: User = { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' }
const grace = { name: 'Grace Hopper', email: 'grace@example.com' }

describe('useCreateUser', () => {
  it('adds the created user to the users list', async () => {
    useFakeUsersApi([ada])
    const { result } = renderUsersAndCreate()
    await waitFor(() => expect(result.current.users.data).toHaveLength(1))

    act(() => result.current.createUser.mutate({ data: grace }))

    await waitFor(() =>
      expect(result.current.users.data?.map((user) => user.name)).toEqual([
        'Ada Lovelace',
        'Grace Hopper',
      ]),
    )
    await waitFor(() => expect(result.current.createUser.isSuccess).toBe(true))
  })

  it('shows the created user right away and stays pending until the list refetch finishes', async () => {
    const users = [ada]
    useFakeUsersApi(users)
    // Hold the refetch until the test releases it.
    let finishRefetch = () => {}
    const refetchReleased = new Promise<void>((resolve) => {
      finishRefetch = resolve
    })
    let holdRefetch = false
    server.use(
      http.get('*/users', async () => {
        if (holdRefetch) {
          await refetchReleased
        }
        return HttpResponse.json(users)
      }),
    )
    const { result } = renderUsersAndCreate()
    await waitFor(() => expect(result.current.users.data).toHaveLength(1))
    holdRefetch = true

    act(() => result.current.createUser.mutate({ data: grace }))

    await waitFor(() =>
      expect(result.current.users.data?.map((user) => user.name)).toEqual([
        'Ada Lovelace',
        'Grace Hopper',
      ]),
    )
    expect(result.current.createUser.isPending).toBe(true)

    act(() => finishRefetch())

    await waitFor(() => expect(result.current.createUser.isSuccess).toBe(true))
  })

  it('reports an error and leaves the list unchanged when creating fails', async () => {
    useFakeUsersApi([ada])
    server.use(
      http.post('*/users', () => new HttpResponse(null, { status: 500 })),
    )
    const { result } = renderUsersAndCreate()
    await waitFor(() => expect(result.current.users.data).toHaveLength(1))

    act(() => result.current.createUser.mutate({ data: grace }))

    await waitFor(() => expect(result.current.createUser.isError).toBe(true))
    expect(result.current.users.data?.map((user) => user.name)).toEqual([
      'Ada Lovelace',
    ])
  })

  it("still runs the caller's onSuccess", async () => {
    useFakeUsersApi([ada])
    const onSuccess = vi.fn()
    const { result } = renderHook(() =>
      useCreateUser({ mutationConfig: { onSuccess } }),
    )

    act(() => result.current.mutate({ data: grace }))

    await waitFor(() => expect(onSuccess).toHaveBeenCalledOnce())
    expect(onSuccess.mock.lastCall?.[0]).toEqual({ id: 2, ...grace })
  })
})
