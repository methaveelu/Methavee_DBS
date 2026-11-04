import type { Account } from '../../api/types'
import { formatMoney } from '../../lib/format'

interface AccountListProps {
  accounts: Account[]
}

export function AccountList({ accounts }: AccountListProps) {
  return (
    <section aria-labelledby="accounts-title">
      <h2 id="accounts-title" className="section-title">
        Accounts
      </h2>
      {accounts.length === 0 ? (
        <p className="empty-note">No accounts to show.</p>
      ) : (
        <ul className="account-list">
          {accounts.map((account) => (
            <li key={account.id} className="card account-card">
                
              <p className="account-name">{account.name}</p>
              <p className="account-number">{account.maskedNumber}</p>
              <p className="account-balance">{formatMoney(account.balance)}</p>
              {account.type === 'credit' && (
                <p className="account-due">Amount due</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}