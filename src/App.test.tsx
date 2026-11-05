import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { formatMoney } from './lib/format'
import { exactText, renderApp } from './test/render'

describe('App', () => {
  it('shows the dashboard once the data has loaded', async () => {
    renderApp()

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
  })
})
