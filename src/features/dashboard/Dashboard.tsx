import { useState } from 'react'
import { TransferDialog } from '../transfer/TransferDialog'
import { AccountList } from './AccountList'
import { BalanceHero } from './BalanceHero'
import { DailyLimit } from './DailyLimit'
import { DashboardError } from './DashboardError'
import { DashboardSkeleton } from './DashboardSkeleton'
import { TransactionList } from './TransactionList'
import { useDashboardData } from './useDashboardData'

export function Dashboard() {
  const { customer, accounts, transactions, isError, retry } =
    useDashboardData()
  const [isTransferOpen, setTransferOpen] = useState(false)

  if (isError) return <DashboardError onRetry={retry} />
  if (!customer || !accounts || !transactions) return <DashboardSkeleton />

  return (
    <div className="dashboard">
      <div className="dashboard-main">
        <h1 className="greeting">Good evening, {customer.firstName}</h1>
        <BalanceHero
          accounts={accounts}
          onNewTransfer={() => setTransferOpen(true)}
        />
        <AccountList accounts={accounts} />
        <TransactionList transactions={transactions} />
      </div>
      <aside className="dashboard-rail">
        <DailyLimit customer={customer} />
      </aside>
      {isTransferOpen && (
        <TransferDialog
          accounts={accounts}
          customer={customer}
          onClose={() => setTransferOpen(false)}
        />
      )}
    </div>
  )
}