import type { RefObject } from 'react'
import type { Transfer } from '../../api/types'
import { formatMoney } from '../../lib/format'

interface SuccessPanelProps {
  transfer: Transfer
  titleRef: RefObject<HTMLHeadingElement | null>
  onDone: () => void
}

export function SuccessPanel({ transfer, titleRef, onDone }: SuccessPanelProps) {
  const { recipient } = transfer

  return (
    <div className="success-panel">
      <h3 ref={titleRef} tabIndex={-1}>
        Transfer sent
      </h3>
      <p className="success-amount">{formatMoney(transfer.amount)}</p>
      <p>
        to {recipient.name} · {recipient.bank} · {recipient.accountNumberMasked}
      </p>
      <p>
        Reference <strong>{transfer.reference}</strong>
      </p>
      <p>The money should arrive within minutes.</p>
      <button type="button" className="button button-primary" onClick={onDone}>
        Back to dashboard
      </button>
    </div>
  )
}