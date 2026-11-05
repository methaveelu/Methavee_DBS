import {
  useAccounts,
  useCustomer,
  useTransactions,
} from '../../api/queries'

export function useDashboardData() {
  const customer = useCustomer()
  const accounts = useAccounts()
  const transactions = useTransactions()

  const queries = [customer, accounts, transactions]

  // `data === undefined` forfailed background refresh
  const isError = queries.some(
    (query) => query.data === undefined && query.isError,
  )

  function retry() {
    queries
      .filter((query) => query.isError)
      .forEach((query) => void query.refetch())
  }

  return {
    customer: customer.data,
    accounts: accounts.data,
    transactions: transactions.data,
    isError,
    retry,
  }
}