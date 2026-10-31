import '@testing-library/jest-dom/vitest'
import { server } from './mocks/server'

// Fail on any request without a handler so tests never hit the real network.
beforeAll(() => server.listen({ onUnhandledFrame: 'error' }))
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
