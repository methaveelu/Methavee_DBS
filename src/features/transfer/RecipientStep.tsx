import { useState } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { usePayees } from '../../api/queries'
import { FieldError, TextField, useFieldError } from './Field'
import {
  BANKS,
  NEW_RECIPIENT,
  type TransferFormValues,
} from './transferSchema'

export function RecipientStep() {
  const { control, register } = useFormContext<TransferFormValues>()
  const payees = usePayees()
  const [search, setSearch] = useState('')
  const payeeError = useFieldError('payeeId')
  const bankError = useFieldError('newBank')
  const payeeId = useWatch({ control, name: 'payeeId' })
  const isNewRecipient = payeeId === NEW_RECIPIENT

  const term = search.trim().toLowerCase()
  const allPayees = payees.data ?? []
  const matches = allPayees.filter(
    (payee) =>
      payee.name.toLowerCase().includes(term) ||
      payee.bank.toLowerCase().includes(term),
  )

  return (
    <>
      <label className="search">
        <span className="visually-hidden">Search payees</span>
        <input
          type="search"
          placeholder="Search payees"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            // Enter in here should not press Continue.
            if (event.key === 'Enter') event.preventDefault()
          }}
        />
      </label>

      <fieldset
        className="payee-list"
        aria-describedby={payeeError.inputProps['aria-describedby']}
      >
        <legend className="visually-hidden">Choose a recipient</legend>

        {payees.isFetching && !payees.data && (
          <p className="empty-note">Loading payees…</p>
        )}

        {payees.isError && (
          <div className="empty-state" role="alert">
            <p>We couldn't load your payees.</p>
            <button
              type="button"
              className="link-button"
              onClick={() => void payees.refetch()}
            >
              Retry
            </button>
          </div>
        )}

        {payees.isSuccess && matches.length === 0 && (
          <p className="empty-note">
            {term ? 'No payees match your search.' : 'You have no saved payees yet.'}
          </p>
        )}

        {allPayees.map((payee) => (
          <label
            key={payee.id}
            className="payee-option"
            hidden={!matches.includes(payee) && payee.id !== payeeId}
          >
            <input type="radio" value={payee.id} {...register('payeeId')} />
            <span className="payee-initials" aria-hidden="true">
              {payee.initials}
            </span>
            <span>
              <span className="payee-name">{payee.name}</span>
              <span className="payee-detail">
                {payee.bank} · {payee.accountNumberMasked}
              </span>
            </span>
          </label>
        ))}

        <label className="payee-option">
          <input type="radio" value={NEW_RECIPIENT} {...register('payeeId')} />
          <span className="payee-name">Send to someone new</span>
        </label>
      </fieldset>

      <FieldError id={payeeError.errorId} message={payeeError.message} />

      {isNewRecipient && (
        <div className="new-recipient">
          <TextField name="newName" label="Recipient name" autoComplete="off" />
          <TextField
            name="newAccountNumber"
            label="Account number (8 digits)"
            inputMode="numeric"
            autoComplete="off"
          />
          <div className="field">
            <label htmlFor="newBank">Bank</label>
            <select id="newBank" {...bankError.inputProps} {...register('newBank')}>
              <option value="">Choose a bank</option>
              {BANKS.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </select>
            <FieldError id={bankError.errorId} message={bankError.message} />
          </div>
        </div>
      )}
    </>
  )
}