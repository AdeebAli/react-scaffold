/** A route: its pattern for the route table, and a builder for links to it. */
export type AppPath = {
  /** React Router pattern, e.g. `/users/:userId`. */
  path: string
  /** Builds a URL for links. Takes the route's params, e.g. `(userId: string) => ...`. */
  getHref: (...args: never[]) => string
}

export const paths = {
  home: {
    path: '/',
    getHref: () => '/',
  },
  users: {
    path: '/users',
    getHref: () => '/users',
  },
} as const satisfies Record<string, AppPath>

export type Paths = typeof paths
