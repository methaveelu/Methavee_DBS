import { TRANSACTION_LIMIT } from '../../api/queries'
import { Skeleton } from '../../components/Skeleton'

// D1: shown while the customer, accounts and transactions load.
// It uses the same layout and text classes as the real dashboard, so nothing
// jumps when the data arrives. Fixed copy from the brief (headings, captions)
// is real text; only what comes from the API is a placeholder.
// Screen readers hear one "Loading" message instead of a page of grey boxes.

const ACCOUNT_COUNT = 3

export const DashboardSkeleton = () => {
    return (
        <div className='dashboard-layout' aria-busy='true'>
            <p role='status' className='visually-hidden'>
                Loading your dashboard…
            </p>

            <div className='dashboard-main' aria-hidden='true'>
                {/* Greeting: needs the customer's first name */}
                <h1 className='greeting'>
                    <Skeleton width='11ch' />
                </h1>

                {/* Total available: needs the accounts */}
                <section className='balance-hero'>
                    <p className='balance-label'>Total available</p>
                    <p className='balance-total'>
                        <Skeleton width='9ch' />
                    </p>
                    <p className='balance-caption'>Across 2 deposit accounts</p>
                    <Skeleton width='9rem' height='var(--tap-target)' />
                </section>

                {/* Account cards: needs the accounts */}
                <section className='accounts'>
                    <h2 className='section-title'>Accounts</h2>
                    <ul className='account-list'>
                        {Array.from({ length: ACCOUNT_COUNT }, (_, index) => (
                            <li key={index} className='card account-card'>
                                <p className='account-name'>
                                    <Skeleton width='14ch' />
                                </p>
                                <p className='account-number'>
                                    <Skeleton width='7ch' />
                                </p>
                                <p className='account-balance'>
                                    <Skeleton width='10ch' />
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* Recent transactions: needs the transactions */}
                <section className='card transactions'>
                    <div className='transactions-header'>
                        <h2 className='section-title'>Recent transactions</h2>
                        <Skeleton width='16rem' height='var(--tap-target)' />
                    </div>
                    <ul className='transaction-list'>
                        {Array.from({ length: TRANSACTION_LIMIT }, (_, index) => (
                            <li key={index} className='transaction-row'>
                                <div>
                                    <p className='transaction-description'>
                                        <Skeleton width='16ch' />
                                    </p>
                                    <p className='transaction-meta'>
                                        <Skeleton width='12ch' />
                                    </p>
                                </div>
                                <p className='transaction-amount'>
                                    <Skeleton width='9ch' />
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {/* Daily limit: needs the customer */}
            <aside className='dashboard-rail' aria-hidden='true'>
                <section className='card daily-limit'>
                    <h2 className='section-title'>Daily limit</h2>
                    <p className='daily-limit-remaining'>
                        <Skeleton width='18ch' />
                    </p>
                    <p className='daily-limit-note'>
                        Resets daily. Applies to all transfers.
                    </p>
                </section>
            </aside>
        </div>
    )
}
