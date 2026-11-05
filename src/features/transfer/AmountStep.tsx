import { useFormContext, useWatch } from 'react-hook-form'
import type { Account } from '../../api/types'
import { formatMoney } from '../../lib/format'
import { FieldError, TextField, useFieldError } from './Field'
import { NOTE_MAX_LENGTH, type TransferFormValues } from './transferSchema'

const QUICK_AMOUNTS = ['50', '100', '250', '500']

interface AmountStepProps {
  accounts: Account[]
  remainingLimit: number
}

export function AmountStep({ accounts, remainingLimit }: AmountStepProps) {
  const { control, getValues, register, setValue, trigger } =
    useFormContext<TransferFormValues>()
  const fromAccountId = useWatch({ control, name: 'fromAccountId' })
  const note = useWatch({ control, name: 'note' })
  const fromError = useFieldError('fromAccountId')

  const fromAccount = accounts.find(({ id }) => id === fromAccountId)

  return (
    <>
      <div className="field">
        <label htmlFor="fromAccountId">From account</label>
        <select
          id="fromAccountId"
          {...fromError.inputProps}
          {...register('fromAccountId', {
            // The amount rule depends on this account's balance.
            onChange: () => {
              if (getValues('amount') !== '') void trigger('amount')
            },
          })}
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} · {account.maskedNumber}
            </option>
          ))}
        </select>
        <p className="field-hint">Deposit accounts only</p>
        <FieldError id={fromError.errorId} message={fromError.message} />
      </div>

      <TextField name="amount" label="Amount (SGD)" inputMode="decimal" autoComplete="off" />

      <div className="quick-amounts">
        {QUICK_AMOUNTS.map((amount) => (
          <button
            key={amount}
            type="button"
            className="button button-secondary"
            onClick={() =>
              setValue('amount', amount, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          >
            {amount}
          </button>
        ))}
      </div>

      <dl className="amount-facts">
        <div>
          <dt>Available</dt>
          <dd>{fromAccount && formatMoney(fromAccount.balance)}</dd>
        </div>
        <div>
          <dt>Remaining daily limit</dt>
          <dd>{formatMoney(remainingLimit)}</dd>
        </div>
      </dl>

      <TextField
        name="note"
        label="Note (optional)"
        autoComplete="off"
        hint={
          <span className="field-counter">
            {note.length}/{NOTE_MAX_LENGTH}
          </span>
        }
      />
    </>
  )
}