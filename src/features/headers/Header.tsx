//Header.** Meridian logo, `Good evening, Ava`, Retail/Premium switch,
//   light/dark toggle, `AC` avatar. Use the greeting as written; it doesn't
//   need to change with the time of day.

import { useCustomer } from '../../api/queries'
import { SegmentSwitch } from '../theme/SegmentSwitch'
import { ThemeToggle } from '../theme/ThemeToggle'

export function Header() {
  const { data: customer } = useCustomer()

  return (
    <header className="app-header">
      <div className="app-header-inner">
        <div className="logo">
          <span className="logo-mark">
            Meridian
          </span>
        </div>

        <nav aria-label="Main">
          <ul className="nav-list">
            <li>
            <span aria-current="page">Overview</span>
            </li>
            <li>
            <span aria-current="page">Cards</span>
            </li>
            <li>
            <span aria-current="page">Payments</span>
            </li>
            <li>
            <span aria-current="page">Insights</span>
            </li>
          </ul>
        </nav>

        <div className="header-controls">
          <SegmentSwitch defaultSegment={customer?.segment} />
          <ThemeToggle />
          <span
            className="avatar"
            role="img"
            aria-label={
              customer
                ? `${customer.firstName} ${customer.lastName}`
                : 'Your profile'
            }
          >
            {customer && `${customer.firstName[0]}${customer.lastName[0]}`}
          </span>
        </div>
      </div>
    </header>
  )
}