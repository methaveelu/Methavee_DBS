import { useState } from 'react'
import type { Transaction } from '../../api/types'
import { searchAccounts} from '../../lib/selectors'
import { TransactionRow } from './TransactionRow'

interface TransactionListProps {
  transactions: Transaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {
  const [search, setSearch] = useState('')
  const matches = searchAccounts(transactions, search)
  const isSearching = search.trim() !== ''

  return (
    <section className="card transactions" aria-labelledby="transactions-title">
      <div className="transactions-header">
        <h2 id="transactions-title" className="section-title">
          Recent transactions
        </h2>
        <label className="search">
          <span className="visually-hidden">Search transactions</span>
          <input
            type="search"
            placeholder="Search transactions"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
      </div>

      <p className="search-status" role="status">
        {isSearching && matches.length > 0 && (
          <>
            {matches.length} {matches.length === 1 ? 'result' : 'results'}
            <button
              type="button"
              className="link-button"
              onClick={() => setSearch('')}
            >
              Clear search
            </button>
          </>
        )}
      </p>

      {matches.length > 0 && (
        <ul className="transaction-list">
          {matches.map((transaction) => (
            <TransactionRow key={transaction.id} transaction={transaction} />
          ))}
        </ul>
      )}

      {isSearching && matches.length === 0 && (
        <div className="empty-state">
          <p>No transactions match your search.</p>
          <button
            type="button"
            className="link-button"
            onClick={() => setSearch('')}
          >
            Clear search
          </button>
        </div>
      )}

      {!isSearching && matches.length === 0 && (
        <p className="empty-note">No transactions yet.</p>
      )}
    </section>
  )
}