// env.ts validates at import time, so each test stubs the variable and
// imports a fresh copy of the module.
async function loadEnv(apiUrl: string | undefined) {
  vi.resetModules()
  vi.stubEnv('VITE_APP_API_URL', apiUrl)
  const { env } = await import('../env')
  return env
}

describe('env', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('defaults the API URL to JSONPlaceholder when it is not set', async () => {
    const env = await loadEnv(undefined)

    expect(env.API_URL).toBe('https://jsonplaceholder.typicode.com')
  })

  it('treats an empty API URL as not set', async () => {
    const env = await loadEnv('')

    expect(env.API_URL).toBe('https://jsonplaceholder.typicode.com')
  })

  it('accepts an http(s) origin', async () => {
    const env = await loadEnv('https://api.example.com')

    expect(env.API_URL).toBe('https://api.example.com')
  })

  it.each([
    'https://api.example.com/v1',
    'https://api.example.com?key=1',
    'ftp://api.example.com',
    'not a url',
  ])('rejects %s', async (apiUrl) => {
    await expect(loadEnv(apiUrl)).rejects.toThrow('Invalid env')
  })
})
