import { http, HttpResponse } from 'msw'
import { createUserInputSchema, type User } from '../../../api/users/type'

export const usersHandlers = [
  http.get('*/users', () =>
    HttpResponse.json<User[]>([
      { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
      { id: 2, name: 'Grace Hopper', email: 'grace@example.com' },
    ]),
  ),
  http.post('*/users', async ({ request }) => {
    const newUser = createUserInputSchema.parse(await request.json())
    return HttpResponse.json<User>(
      { id: Date.now(), ...newUser },
      { status: 201 },
    )
  }),
]
