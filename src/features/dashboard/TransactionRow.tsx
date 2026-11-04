import type { Transaction } from '../../api/types'
import { formatMoney, formatShortDate } from '../../lib/format'

interface TransactionRowProps {
  transaction: Transaction
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const isMoneyIn = transaction.direction === 'in'

  return (
    <li className="transaction-row">
      <div>
        <p className="transaction-description">{transaction.description}</p>
        <p className="transaction-meta">
          <span className="transaction-category">{transaction.category}</span>
          {' · '}
          {formatShortDate(transaction.date)}
        </p>
      </div>
      <div className="transaction-side">
        {transaction.status === 'pending' && (
          <span className="chip">Pending</span>
        )}
        <span className={isMoneyIn ? 'amount amount-in' : 'amount'}>
          {isMoneyIn
            ? `+${formatMoney(transaction.amount)}`
            : formatMoney(-transaction.amount)}
        </span>
      </div>
    </li>
  )
}