import { http, HttpResponse } from 'msw'
import { server } from '../../../../testing/mocks/server'
import { render, screen, waitFor } from '../../../../testing/test-utils'
import { UserList } from '../UserList'

describe('UserList', () => {
  it('shows the users once they load', async () => {
    render(<UserList />)

    expect(screen.getByRole('status')).toHaveTextContent(/loading users/i)

    const list = await screen.findByRole('list', { name: 'Users' })
    expect(list).toHaveTextContent('Ada Lovelace')
    expect(list).toHaveTextContent('grace@example.com')
  })

  it('tells the user when there are no users', async () => {
    server.use(http.get('*/users', () => HttpResponse.json([])))

    render(<UserList />)

    await waitFor(() =>
      expect(screen.getByRole('status')).toHaveTextContent(/no users yet/i),
    )
  })

  it('shows an error when the request fails', async () => {
    server.use(
      http.get('*/users', () => new HttpResponse(null, { status: 500 })),
    )

    render(<UserList />)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /couldn't load users/i,
    )
  })

  it('shows an error when the response has an unexpected shape', async () => {
    server.use(
      http.get('*/users', () => HttpResponse.json([{ id: 'not-a-number' }])),
    )

    render(<UserList />)

    expect(await screen.findByRole('alert')).toBeInTheDocument()
  })
})
