import type { z } from 'zod'
import { env } from '../config/env'

export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type QueryParamValue = string | number | boolean
export type QueryParams = Record<
  string,
  QueryParamValue | readonly QueryParamValue[] | null | undefined
>

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export type RequestOptions = {
  /** Query string params. `null`/`undefined` are skipped; arrays become repeated keys (`?id=1&id=2`). */
  params?: QueryParams
  /** Sent as JSON. Omit for no body. */
  body?: unknown
  /** Aborts the request. Pass React Query's `signal` so stale requests are cancelled. */
  signal?: AbortSignal
}

function buildUrl(path: string, params: QueryParams = {}) {
  const url = new URL(path, env.API_URL)
  // An absolute or protocol-relative path (`//other.example`) would replace
  // the API origin and send the request elsewhere.
  if (url.origin !== new URL(env.API_URL).origin) {
    throw new Error(`API path must be relative to the API origin: ${path}`)
  }
  for (const [key, value] of Object.entries(params)) {
    if (value == null) {
      continue
    }
    const values: readonly QueryParamValue[] = Array.isArray(value)
      ? value
      : [value]
    for (const item of values) {
      url.searchParams.append(key, String(item))
    }
  }
  return url
}

/**
 * Sends a request and validates the JSON response against `schema`. Every API
 * call must go through here so nothing untyped crosses the network boundary.
 * An empty response (e.g. 204) is parsed as `undefined`, so use `z.undefined()` for those.
 * Non-2xx responses and bodies that aren't JSON throw an `ApiError`.
 *
 * Prefer the method helpers below; they call this.
 *
 * @example
 * // Query: pass React Query's signal so stale requests are cancelled
 * useQuery({
 *   queryKey: ['users', { search }],
 *   queryFn: ({ signal }) => apiGet('/users', z.array(UserSchema), { params: { search }, signal }),
 * })
 *
 * // Mutation with a JSON body
 * apiPost('/users', UserSchema, { body: { name: 'Ada', email: 'ada@example.com' } })
 *
 * // Empty (204) response
 * apiDelete(`/users/${encodeURIComponent(id)}`, z.undefined())
 *
 * // Any method directly
 * apiRequest('PATCH', '/users/1', UserSchema, { body: { name: 'Ada L.' } })
 */
export async function apiRequest<T extends z.ZodType>(
  method: HttpMethod,
  path: string,
  schema: T,
  { params, body, signal }: RequestOptions = {},
): Promise<z.infer<T>> {
  const hasBody = body !== undefined
  const response = await fetch(buildUrl(path, params), {
    method,
    signal,
    headers: {
      Accept: 'application/json',
      ...(hasBody && { 'Content-Type': 'application/json' }),
    },
    body: hasBody ? JSON.stringify(body) : undefined,
  })
  if (!response.ok) {
    throw new ApiError(
      response.status,
      `${method} ${path} failed with ${response.status}`,
    )
  }
  const text = await response.text()
  let data: unknown
  try {
    data = text === '' ? undefined : JSON.parse(text)
  } catch {
    throw new ApiError(
      response.status,
      `${method} ${path} returned a response that is not JSON`,
    )
  }
  return schema.parse(data)
}

export function apiGet<T extends z.ZodType>(
  path: string,
  schema: T,
  options?: Omit<RequestOptions, 'body'>,
) {
  return apiRequest('GET', path, schema, options)
}

export function apiPost<T extends z.ZodType>(
  path: string,
  schema: T,
  options?: RequestOptions,
) {
  return apiRequest('POST', path, schema, options)
}

export function apiPut<T extends z.ZodType>(
  path: string,
  schema: T,
  options?: RequestOptions,
) {
  return apiRequest('PUT', path, schema, options)
}

export function apiPatch<T extends z.ZodType>(
  path: string,
  schema: T,
  options?: RequestOptions,
) {
  return apiRequest('PATCH', path, schema, options)
}

export function apiDelete<T extends z.ZodType>(
  path: string,
  schema: T,
  options?: RequestOptions,
) {
  return apiRequest('DELETE', path, schema, options)
}
