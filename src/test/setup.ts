import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, beforeEach } from 'vitest'
import { handlers, resetMockDb } from '../mocks/handlers'

// jsdom has <dialog> but not showModal() or close(). This stand-in does the two
// things the app relies on: setting `open`, and firing `close` so React's
// onClose runs. It doesn't trap focus or hand focus back like a real browser.
HTMLDialogElement.prototype.showModal = function showModal(
  this: HTMLDialogElement,
) {
  this.open = true
}
HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
  if (!this.open) return
  this.open = false
  this.dispatchEvent(new Event('close'))
}

export const server = setupServer(...handlers)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
beforeEach(() => resetMockDb())
afterEach(() => server.resetHandlers())
// Testing Library only unmounts automatically when Vitest globals are on, and
// they're off here. Without this, each test's page stays in the DOM for the next.
afterEach(() => cleanup())
afterAll(() => server.close())
