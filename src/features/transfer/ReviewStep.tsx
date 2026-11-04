import { useFormContext } from 'react-hook-form'
import { usePayees } from '../../api/queries'
import type { Account } from '../../api/types'
import { formatMoney } from '../../lib/format'
import { NEW_RECIPIENT, type TransferFormValues } from './transferSchema'

interface ReviewStepProps {
  accounts: Account[]
  sendError: string | null
}

export function ReviewStep({ accounts, sendError }: ReviewStepProps) {
  const { getValues } = useFormContext<TransferFormValues>()
  const { data: payees } = usePayees()
  const values = getValues()

  const account = accounts.find(({ id }) => id === values.fromAccountId)
  const payee = payees?.find(({ id }) => id === values.payeeId)
  const amount = Number(values.amount)

  const savedRecipient = payee
    ? `${payee.name} · ${payee.bank} · ${payee.accountNumberMasked}`
    : 'Loading…'
  const recipient =
    values.payeeId === NEW_RECIPIENT
      ? `${values.newName.trim()} · ${values.newBank} · •••• ${values.newAccountNumber.trim().slice(-4)}`
      : savedRecipient

  return (
    <>
      {sendError && (
        <p className="send-error" role="alert">
          {sendError}
        </p>
      )}

      <dl className="review-list">
        <div>
          <dt>From</dt>
          <dd>
            {account?.name} · {account?.maskedNumber}
          </dd>
        </div>
        <div>
          <dt>To</dt>
          <dd>{recipient}</dd>
        </div>
        <div>
          <dt>Amount</dt>
          <dd>{formatMoney(amount)}</dd>
        </div>
        <div>
          <dt>Fee</dt>
          <dd>{formatMoney(0)}</dd>
        </div>
        {values.note !== '' && (
          <div>
            <dt>Note</dt>
            <dd>{values.note}</dd>
          </div>
        )}
        <div className="review-total">
          <dt>Total</dt>
          <dd>{formatMoney(amount)}</dd>
        </div>
      </dl>
    </>
  )
}