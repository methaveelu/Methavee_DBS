import type { Account } from '../../api/types'
import { formatMoney } from '../../lib/format'
import { depositAccounts, totalAvailable } from '../../lib/selectors'

interface BalanceHeroProps {
  accounts: Account[]
  onNewTransfer: () => void
}

export function BalanceHero({ accounts, onNewTransfer }: BalanceHeroProps) {
  const count = depositAccounts(accounts).length

  return (
    <section className="hero" aria-labelledby="total-available">
      <div>
        <h2 id="total-available" className="hero-label">
          Total available
        </h2>
        <p className="hero-amount">{formatMoney(totalAvailable(accounts))}</p>
        <p className="hero-caption">
          Across {count} deposit {count === 1 ? 'account' : 'accounts'}
        </p>
      </div>
      <button
        type="button"
        className="button button-primary new-transfer"
        onClick={onNewTransfer}
      >
        New transfer
      </button>
    </section>
  )
}