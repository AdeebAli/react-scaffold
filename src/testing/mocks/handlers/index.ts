import { usersHandlers } from './users'

// Default "happy path" responses for tests. Override per test with `server.use(...)`.
export const handlers = [...usersHandlers]
