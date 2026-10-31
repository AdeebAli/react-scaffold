import { z } from 'zod'

const EnvSchema = z.object({
  /** API origin, with no path. Defaults to JSONPlaceholder, a free fake REST API. */
  API_URL: z
    .httpUrl()
    // Request paths replace the URL's path, so a base path would be dropped.
    .refine((value) => {
      try {
        const { pathname, search, hash } = new URL(value)
        return pathname === '/' && search === '' && hash === ''
      } catch {
        // httpUrl() already reports unparseable values.
        return true
      }
    }, 'Must be an origin with no path, e.g. https://api.example.com')
    .default('https://jsonplaceholder.typicode.com'),
})

function createEnv() {
  const parsed = EnvSchema.safeParse({
    // An empty value counts as unset, so it falls back to the default.
    API_URL: import.meta.env.VITE_APP_API_URL || undefined,
  })

  if (!parsed.success) {
    throw new Error(`Invalid env:\n${z.prettifyError(parsed.error)}`)
  }

  return parsed.data
}

export const env = createEnv()
