import { screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { formatMoney } from '../../lib/format'
import { exactText, renderApp } from '../../test/render'
import { server } from '../../test/setup'

const DASHBOARD_ERROR = "We couldn't load your dashboard."
const LOADING = 'Loading your dashboard…'

// Makes the next request to `path` fail with a 500. Later requests reach the
// normal mock handler again, which is what Retry needs.
function failOnce(path: string) {
  server.use(
    http.get(
      `*${path}`,
      () =>
        HttpResponse.json(
          { error: { code: 'INTERNAL_ERROR', message: 'Down' } },
          { status: 500 },
        ),
      { once: true },
    ),
  )
}

afterEach(() => {
  server.events.removeAllListeners()
})

async function findDashboardError() {
  return screen.findByRole('alert', {}, { timeout: 3000 })
}

async function expectDashboardLoaded() {
  expect(
    await screen.findByRole(
      'heading',
      { name: 'Good evening, Ava' },
      { timeout: 3000 },
    ),
  ).toBeInTheDocument()
  const totalAvailable = screen.getByRole('region', { name: 'Total available' })
  expect(
    within(totalAvailable).getByText(formatMoney(17120.55), exactText),
  ).toBeInTheDocument()
  expect(screen.queryByText(DASHBOARD_ERROR)).not.toBeInTheDocument()
}

describe('Dashboard loading (D1)', () => {
  it('shows the loading skeleton until the data arrives', async () => {
    renderApp()

    expect(screen.getByRole('status')).toHaveTextContent(LOADING)
    await expectDashboardLoaded()
    expect(screen.queryByText(LOADING)).not.toBeInTheDocument()
  })
})

// Required test 3 (E4): a failed dashboard request shows the error, and Retry
// loads it.
describe('Dashboard error and Retry (D7, E4 test 3)', () => {
  it.each(['/api/customer', '/api/accounts', '/api/transactions'])(
    'shows the error when %s fails, and Retry loads the dashboard',
    async (path) => {
      failOnce(path)
      const { user } = renderApp()

      const error = await findDashboardError()
      expect(error).toHaveTextContent(DASHBOARD_ERROR)
      expect(
        screen.queryByRole('heading', { name: 'Good evening, Ava' }),
      ).not.toBeInTheDocument()

      await user.click(within(error).getByRole('button', { name: 'Retry' }))

      await expectDashboardLoaded()
    },
  )

  it('shows the error again if Retry also fails, and the next Retry recovers', async () => {
    // Counts finished responses for /api/accounts, to prove Retry asks again.
    let accountResponses = 0
    server.events.on('response:mocked', ({ request }) => {
      if (new URL(request.url).pathname.endsWith('/api/accounts')) {
        accountResponses += 1
      }
    })
    failOnce('/api/accounts')
    failOnce('/api/accounts')
    const { user } = renderApp()

    const error = await findDashboardError()
    expect(accountResponses).toBe(1)

    await user.click(within(error).getByRole('button', { name: 'Retry' }))

    // The second request fails too: the error is still shown, not a blank page.
    await waitFor(() => expect(accountResponses).toBe(2), { timeout: 3000 })
    expect(screen.getByRole('alert')).toHaveTextContent(DASHBOARD_ERROR)

    await user.click(
      within(screen.getByRole('alert')).getByRole('button', { name: 'Retry' }),
    )

    await expectDashboardLoaded()
    expect(accountResponses).toBe(3)
  })
})
