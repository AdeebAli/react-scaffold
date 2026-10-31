import { delay, http, HttpResponse } from 'msw'
import { z } from 'zod'
import { server } from '../../testing/mocks/server'
import {
  ApiError,
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPut,
} from '../api-client'

// Echoes the received query string back so tests can see what was sent.
function echoQuery() {
  server.use(
    http.get('*/api/echo', ({ request }) => {
      const { searchParams } = new URL(request.url)
      return HttpResponse.json({ query: searchParams.toString() })
    }),
  )
}

const EchoSchema = z.object({ query: z.string() })

describe('apiGet', () => {
  it('sends query params, encoding values', async () => {
    echoQuery()

    const result = await apiGet('/api/echo', EchoSchema, {
      params: { search: 'ada & grace', page: 2, active: true },
    })

    expect(result.query).toBe('search=ada+%26+grace&page=2&active=true')
  })

  it('repeats the key for array params and skips empty ones', async () => {
    echoQuery()

    const result = await apiGet('/api/echo', EchoSchema, {
      params: { id: [1, 2], sort: undefined, filter: null },
    })

    expect(result.query).toBe('id=1&id=2')
  })

  it('keeps query params already in the path', async () => {
    echoQuery()

    const result = await apiGet('/api/echo?fixed=yes', EchoSchema, {
      params: { page: 1 },
    })

    expect(result.query).toBe('fixed=yes&page=1')
  })

  it('throws an ApiError with the status when the request fails', async () => {
    server.use(
      http.get('*/api/echo', () => new HttpResponse(null, { status: 404 })),
    )

    await expect(apiGet('/api/echo', EchoSchema)).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
    } satisfies Partial<ApiError>)
  })

  it('throws an ApiError when a successful response is not JSON', async () => {
    server.use(
      http.get('*/api/echo', () => HttpResponse.html('<p>Sign in</p>')),
    )

    await expect(apiGet('/api/echo', EchoSchema)).rejects.toMatchObject({
      name: 'ApiError',
      status: 200,
    } satisfies Partial<ApiError>)
  })

  it.each(['//other.example/users', 'https://other.example/users'])(
    'refuses to send a request to another origin (%s)',
    async (path) => {
      await expect(apiGet(path, EchoSchema)).rejects.toThrow(
        'API path must be relative to the API origin',
      )
    },
  )

  it('throws when the response does not match the schema', async () => {
    server.use(http.get('*/api/echo', () => HttpResponse.json({ query: 42 })))

    await expect(apiGet('/api/echo', EchoSchema)).rejects.toThrow()
  })

  describe.each([
    ['POST', apiPost],
    ['PUT', apiPut],
    ['PATCH', apiPatch],
    ['DELETE', apiDelete],
  ] as const)('%s', (method, send) => {
    it('sends the method and a JSON body, and returns the parsed response', async () => {
      server.use(
        http.all('*/api/items', async ({ request }) =>
          HttpResponse.json({
            method: request.method,
            contentType: request.headers.get('Content-Type'),
            body: await request.json(),
          }),
        ),
      )

      const result = await send(
        '/api/items',
        z.object({
          method: z.string(),
          contentType: z.string(),
          body: z.object({ name: z.string() }),
        }),
        { body: { name: 'Ada' } },
      )

      expect(result).toEqual({
        method,
        contentType: 'application/json',
        body: { name: 'Ada' },
      })
    })
  })

  it('returns undefined for an empty response', async () => {
    server.use(
      http.delete(
        '*/api/items/1',
        () => new HttpResponse(null, { status: 204 }),
      ),
    )

    await expect(
      apiDelete('/api/items/1', z.undefined()),
    ).resolves.toBeUndefined()
  })

  it('sends no body or Content-Type when there is no body', async () => {
    server.use(
      http.post('*/api/items', async ({ request }) =>
        HttpResponse.json({
          contentType: request.headers.get('Content-Type'),
          body: await request.text(),
        }),
      ),
    )

    const result = await apiPost(
      '/api/items',
      z.object({ contentType: z.null(), body: z.string() }),
    )

    expect(result).toEqual({ contentType: null, body: '' })
  })

  it('stops the request when it is cancelled', async () => {
    server.use(
      http.get('*/api/slow', async () => {
        await delay('infinite')
        return HttpResponse.json({})
      }),
    )
    const controller = new AbortController()

    const request = apiGet('/api/slow', z.object({}), {
      signal: controller.signal,
    })
    controller.abort()

    await expect(request).rejects.toMatchObject({ name: 'AbortError' })
  })
})
