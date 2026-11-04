import { screen, waitFor, within } from '@testing-library/react'
import type { UserEvent } from '@testing-library/user-event'
import { afterEach, describe, expect, it } from 'vitest'
import { formatMoney } from '../../lib/format'
import { exactText, renderApp } from '../../test/render'
import { server } from '../../test/setup'

// Seed data from mock-api/db.json.
const CHECKING_BALANCE = 4280.55
const TOTAL_AVAILABLE = 17120.55
const DAILY_LIMIT = 5000

const OVER_BALANCE_ERROR = `Amount can't be more than your available balance (${formatMoney(CHECKING_BALANCE)}).`
const SEND_ERROR =
  "Something went wrong. Your money hasn't left your account. Try again."

// Collects the body of every POST /api/transfers, without changing what the
// mock API does. An empty list means no request was sent.
function recordTransferRequests() {
  const bodies: Promise<unknown>[] = []
  server.events.on('request:start', ({ request }) => {
    const isTransfer = new URL(request.url).pathname.endsWith('/api/transfers')
    if (request.method === 'POST' && isTransfer) {
      bodies.push(request.clone().json())
    }
  })
  return bodies
}

afterEach(() => {
  server.events.removeAllListeners()
})

async function openTransfer(user: UserEvent) {
  await user.click(
    await screen.findByRole('button', { name: 'New transfer' }, { timeout: 3000 }),
  )
  return screen.getByRole('dialog', { name: 'New transfer' })
}

async function chooseJamieTan(user: UserEvent, dialog: HTMLElement) {
  await user.click(
    await within(dialog).findByRole('radio', { name: /Jamie Tan/ }, { timeout: 3000 }),
  )
  await user.click(within(dialog).getByRole('button', { name: 'Continue' }))
  await within(dialog).findByRole('heading', { name: 'How much?' })
}

async function enterAmount(
  user: UserEvent,
  dialog: HTMLElement,
  amount: string,
  note = '',
) {
  await user.type(within(dialog).getByLabelText('Amount (SGD)'), amount)
  if (note) await user.type(within(dialog).getByLabelText('Note (optional)'), note)
  await user.click(within(dialog).getByRole('button', { name: 'Continue' }))
}

function accountCard(name: string) {
  const card = screen.getByText(name).closest('li')
  if (!card) throw new Error(`No account card for ${name}`)
  return within(card)
}

// Required test 1 (E4): an amount over the balance shows the error and sends
// no request.
describe('Transfer amount over the balance (E4 test 1)', () => {
  it('shows the balance error on the amount field and sends no request', async () => {
    const requests = recordTransferRequests()
    const { user } = renderApp()
    const dialog = await openTransfer(user)
    await chooseJamieTan(user, dialog)

    // One cent over the checking balance.
    await enterAmount(user, dialog, '4280.56')

    const error = await within(dialog).findByText(OVER_BALANCE_ERROR, exactText)
    const amountInput = within(dialog).getByLabelText('Amount (SGD)')

    // The error is tied to the field for screen readers, and focus moves there.
    expect(amountInput).toHaveAttribute('aria-invalid', 'true')
    expect(amountInput).toHaveAttribute('aria-describedby', error.id)
    expect(amountInput).toHaveFocus()

    // The user stays on the amount step: no review, nothing to confirm.
    expect(within(dialog).getByRole('heading', { name: 'How much?' })).toBeInTheDocument()
    expect(
      within(dialog).queryByRole('button', { name: 'Confirm transfer' }),
    ).not.toBeInTheDocument()

    expect(requests).toHaveLength(0)
  })

  it('accepts an amount exactly equal to the balance', async () => {
    const { user } = renderApp()
    const dialog = await openTransfer(user)
    await chooseJamieTan(user, dialog)

    await enterAmount(user, dialog, '4280.55')

    expect(
      await within(dialog).findByRole('heading', { name: 'Check the details' }),
    ).toBeInTheDocument()
    expect(within(dialog).queryByText(OVER_BALANCE_ERROR, exactText)).not.toBeInTheDocument()
  })

  it('clears the error when the user switches to an account with enough money', async () => {
    const { user } = renderApp()
    const dialog = await openTransfer(user)
    await chooseJamieTan(user, dialog)
    await enterAmount(user, dialog, '4280.56')
    await within(dialog).findByText(OVER_BALANCE_ERROR, exactText)

    await user.selectOptions(within(dialog).getByLabelText('From account'), 'acc_savings')

    await waitFor(() => {
      expect(within(dialog).queryByText(OVER_BALANCE_ERROR, exactText)).not.toBeInTheDocument()
    })
  })
})

// Required test 2 (E4): a successful transfer shows the success screen and the
// dashboard updates.
describe('Successful transfer (E4 test 2)', () => {
  it('sends the transfer, shows the success screen and updates the dashboard', async () => {
    const requests = recordTransferRequests()
    const { user } = renderApp()

    // Before: the dashboard shows the seed balances.
    const dialog = await openTransfer(user)
    expect(
      accountCard('Everyday Checking').getByText(formatMoney(CHECKING_BALANCE), exactText),
    ).toBeInTheDocument()

    await chooseJamieTan(user, dialog)
    await enterAmount(user, dialog, '120', 'Dinner')
    await within(dialog).findByRole('heading', { name: 'Check the details' })
    await user.click(within(dialog).getByRole('button', { name: 'Confirm transfer' }))

    // While it's sending, the button can't be pressed again (T5).
    expect(
      await within(dialog).findByRole('button', { name: 'Sending…' }),
    ).toBeDisabled()

    // Success screen (T5).
    const sent = await within(dialog).findByRole(
      'heading',
      { name: 'Transfer sent' },
      { timeout: 3000 },
    )
    expect(sent.closest('[aria-live="polite"]')).not.toBeNull()
    expect(within(dialog).getByText(formatMoney(120), exactText)).toBeInTheDocument()
    expect(within(dialog).getByText('to Jamie Tan · DBS · •••• 3391')).toBeInTheDocument()
    expect(within(dialog).getByText(/^TRF-[A-Z0-9]{6}$/)).toBeInTheDocument()
    expect(
      within(dialog).getByText('The money should arrive within minutes.'),
    ).toBeInTheDocument()

    // Exactly one request, with the saved payee's id and no new-recipient details.
    expect(requests).toHaveLength(1)
    expect(await requests[0]).toEqual({
      fromAccountId: 'acc_checking',
      payeeId: 'pay_001',
      amount: 120,
      note: 'Dinner',
    })

    await user.click(within(dialog).getByRole('button', { name: 'Back to dashboard' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    // After: the dashboard shows the new numbers without a reload (T6).
    expect(
      accountCard('Everyday Checking').getByText(
        formatMoney(CHECKING_BALANCE - 120),
        exactText,
      ),
    ).toBeInTheDocument()

    const total = screen.getByRole('region', { name: 'Total available' })
    expect(
      within(total).getByText(formatMoney(TOTAL_AVAILABLE - 120), exactText),
    ).toBeInTheDocument()

    const transactions = screen.getByRole('region', { name: 'Recent transactions' })
    const newestRow = within(transactions).getAllByRole('listitem')[0]
    expect(newestRow).toHaveTextContent('Transfer to Jamie Tan')
    expect(
      within(newestRow).getByText(formatMoney(-120), exactText),
    ).toBeInTheDocument()

    const dailyLimit = screen.getByRole('region', { name: 'Daily limit' })
    expect(
      within(dailyLimit).getByText(
        `${formatMoney(DAILY_LIMIT - 120)} remaining today`,
        exactText,
      ),
    ).toBeInTheDocument()
  })

  it('stays on review with the data intact when sending fails, and moves no money (T7)', async () => {
    const requests = recordTransferRequests()
    const { user } = renderApp()
    const dialog = await openTransfer(user)
    await chooseJamieTan(user, dialog)

    // The mock API fails any transfer whose note contains #fail.
    await enterAmount(user, dialog, '120', 'Dinner #fail')
    await within(dialog).findByRole('heading', { name: 'Check the details' })
    await user.click(within(dialog).getByRole('button', { name: 'Confirm transfer' }))

    expect(
      await within(dialog).findByRole('alert', {}, { timeout: 3000 }),
    ).toHaveTextContent(SEND_ERROR)

    // Still on review, everything still filled in, and the user can try again.
    expect(within(dialog).getByRole('heading', { name: 'Check the details' })).toBeInTheDocument()
    expect(within(dialog).queryByRole('heading', { name: 'Transfer sent' })).not.toBeInTheDocument()
    expect(within(dialog).getAllByText(formatMoney(120), exactText)).toHaveLength(2)
    expect(within(dialog).getByText('Dinner #fail')).toBeInTheDocument()
    expect(
      within(dialog).getByRole('button', { name: 'Confirm transfer' }),
    ).toBeEnabled()
    expect(requests).toHaveLength(1)

    // No money moved.
    expect(
      accountCard('Everyday Checking').getByText(formatMoney(CHECKING_BALANCE), exactText),
    ).toBeInTheDocument()
  })
})
