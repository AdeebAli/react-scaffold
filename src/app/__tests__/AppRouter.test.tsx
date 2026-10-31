import {
  renderApp,
  screen,
  userEvent,
  waitFor,
  within,
} from '../../testing/test-utils'

describe('app routes', () => {
  it('shows the home page at /', async () => {
    renderApp('/')

    expect(
      await screen.findByRole('heading', { name: 'React Scaffold' }),
    ).toBeInTheDocument()
  })

  it('goes to the users page from the navigation', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await user.click(await screen.findByRole('link', { name: 'Users' }))

    expect(
      await screen.findByRole('heading', { name: 'Users' }),
    ).toBeInTheDocument()
    expect(
      await screen.findByRole('list', { name: 'Users' }),
    ).toHaveTextContent('Ada Lovelace')
  })

  it('names each page in the document title', async () => {
    const user = userEvent.setup()
    renderApp('/')

    await waitFor(() => expect(document.title).toBe('React Scaffold'))

    await user.click(await screen.findByRole('link', { name: 'Users' }))

    await waitFor(() => expect(document.title).toBe('Users · React Scaffold'))
  })

  it('moves focus to the new page heading after navigating, but not on first load', async () => {
    const user = userEvent.setup()
    renderApp('/')

    const homeHeading = await screen.findByRole('heading', {
      name: 'React Scaffold',
    })
    expect(homeHeading).not.toHaveFocus()

    await user.click(screen.getByRole('link', { name: 'Users' }))

    const usersHeading = await screen.findByRole('heading', { name: 'Users' })
    await waitFor(() => expect(usersHeading).toHaveFocus())
  })

  describe('when a page fails', () => {
    beforeEach(() => {
      // React Router logs caught route errors; keep the test output clean.
      vi.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      vi.doUnmock('../routes/UsersRoute')
      vi.restoreAllMocks()
    })

    it('shows an error page inside the layout when the page code fails to load', async () => {
      // Simulates a chunk that no longer exists after a deploy.
      vi.doMock('../routes/UsersRoute', () => {
        throw new TypeError('Failed to fetch dynamically imported module')
      })
      const user = userEvent.setup()
      renderApp('/users')

      expect(
        await screen.findByRole('heading', { name: 'Something went wrong' }),
      ).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument()

      await user.click(
        within(screen.getByRole('navigation', { name: 'Main' })).getByRole(
          'link',
          { name: 'Home' },
        ),
      )

      expect(
        await screen.findByRole('heading', { name: 'React Scaffold' }),
      ).toBeInTheDocument()
    })

    it('shows an error page when the page crashes while rendering', async () => {
      vi.doMock('../routes/UsersRoute', () => ({
        UsersRoute: () => {
          throw new Error('Render failed')
        },
      }))
      const user = userEvent.setup()
      renderApp('/users')

      expect(
        await screen.findByRole('heading', { name: 'Something went wrong' }),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('navigation', { name: 'Main' }),
      ).toBeInTheDocument()

      await user.click(screen.getByRole('link', { name: 'Go home' }))

      expect(
        await screen.findByRole('heading', { name: 'React Scaffold' }),
      ).toBeInTheDocument()
    })
  })

  it('shows a not found page for unknown URLs', async () => {
    renderApp('/does-not-exist')

    expect(
      await screen.findByRole('heading', { name: 'Page not found' }),
    ).toBeInTheDocument()
  })
})
