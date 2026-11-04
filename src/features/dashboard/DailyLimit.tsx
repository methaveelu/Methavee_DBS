import type { Customer } from '../../api/types'
import { formatMoney } from '../../lib/format'
import { remainingDailyLimit } from '../../lib/selectors'

interface DailyLimitProps {
  customer: Customer
}

export function DailyLimit({ customer }: DailyLimitProps) {
  return (
    <section className="card daily-limit" aria-labelledby="daily-limit-title">
      <h2 id="daily-limit-title" className="section-title">
        Daily limit
      </h2>
      <p className="daily-limit-amount">
        {formatMoney(remainingDailyLimit(customer))} remaining today
      </p>
      <progress
        aria-labelledby="daily-limit-title"
        max={customer.dailyTransferLimit}
        value={customer.transferredToday}
      />
      <p className="daily-limit-note">Resets daily. Applies to all transfers.</p>
    </section>
  )
}