import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, SyntheticEvent } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { isApiFailure } from '../../api/queries'
import type { Account, Customer } from '../../api/types'
import { depositAccounts, remainingDailyLimit } from '../../lib/selectors'
import { AmountStep } from './AmountStep'
import { RecipientStep } from './RecipientStep'
import { ReviewStep } from './ReviewStep'
import { Stepper, type TransferStep } from './Stepper'
import { SuccessPanel } from './SuccessPanel'
import {
  makeTransferSchema,
  toTransferRequest,
  type TransferFormValues,
} from './transferSchema'
import { useSendTransfer } from './useSendTransfer'

const STEP_TITLES: Record<TransferStep, string> = {
  recipient: 'Who are you sending to?',
  amount: 'How much?',
  review: 'Check the details',
}

// Which fields each Continue button has to check before moving on.
const STEP_FIELDS = {
  recipient: ['payeeId', 'newName', 'newAccountNumber', 'newBank'],
  amount: ['fromAccountId', 'amount', 'note'],
} as const

const API_FIELDS: Record<string, keyof TransferFormValues> = {
  fromAccountId: 'fromAccountId',
  payeeId: 'payeeId',
  'recipient.name': 'newName',
  'recipient.accountNumber': 'newAccountNumber',
  'recipient.bank': 'newBank',
  amount: 'amount',
  note: 'note',
}

const SEND_ERROR =
  "Something went wrong. Your money hasn't left your account. Try again."

const STEP_CLICK_PAUSE = 500

function sendErrorText(error: unknown): string | null {
  if (!error) return null
  if (isApiFailure(error) && error.status >= 400 && error.status < 500) {
    return [error.message, ...Object.values(error.fields ?? {})].join(' ')
  }
  return SEND_ERROR
}

interface TransferDialogProps {
  accounts: Account[]
  customer: Customer
  onClose: () => void
}

export function TransferDialog({
  accounts,
  customer,
  onClose,
}: TransferDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const footerRef = useRef<HTMLElement>(null)
  const sendLock = useRef(false)
  const [step, setStep] = useState<TransferStep>('recipient')
  const [sendTransfer, transfer] = useSendTransfer()
  const sent = transfer.data?.transfer

  const fromAccounts = useMemo(() => depositAccounts(accounts), [accounts])
  const remainingLimit = remainingDailyLimit(customer)
  const schema = useMemo(
    () => makeTransferSchema({ accounts: fromAccounts, remainingLimit }),
    [fromAccounts, remainingLimit],
  )

  const form = useForm<TransferFormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      payeeId: '',
      newName: '',
      newAccountNumber: '',
      newBank: '',
      fromAccountId: fromAccounts[0]?.id ?? '',
      amount: '',
      note: '',
    },
  })

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) dialog.showModal()
    titleRef.current?.focus()
  }, [step, sent])

  // Confirm transfer appears exactly where Continue was. Ignoring the mouse for
  // a moment after each step means the second click of a double click lands on
  // nothing, so it can't send money before the user has seen the review.
  // A layout effect starts the pause in the same update that changes the label.
  useLayoutEffect(() => {
    const footer = footerRef.current
    if (!footer) return

    footer.style.pointerEvents = 'none'
    const timer = setTimeout(() => {
      footer.style.pointerEvents = ''
    }, STEP_CLICK_PAUSE)

    return () => clearTimeout(timer)
  }, [step])

  function closeDialog() {
    // close() is what hands focus back to the New transfer button.
    dialogRef.current?.close()
  }

  function goBack() {
    // Clears an old send error, so returning to review starts clean.
    transfer.reset()
    setStep(step === 'review' ? 'amount' : 'recipient')
  }

  function preventCloseWhileSending(event: SyntheticEvent) {
    if (transfer.isLoading) event.preventDefault()
  }

  function handleClose() {
    // The browser lets a second Esc through, so reopen while money is moving.
    if (transfer.isLoading) dialogRef.current?.showModal()
    else onClose()
  }

  async function send(values: TransferFormValues) {
    // A second click can land before React has disabled the button, and the
    // API would send the money twice.
    if (sendLock.current) return
    sendLock.current = true

    const { error } = await sendTransfer(toTransferRequest(values))
    sendLock.current = false

    if (!isApiFailure(error)) return
    Object.entries(error.fields ?? {}).forEach(([field, message]) => {
      const name = API_FIELDS[field]
      if (name) form.setError(name, { message })
    })
  }

  async function handleContinue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (step === 'review') {
      await form.handleSubmit(send)(event)
      return
    }

    const fields = STEP_FIELDS[step]
    const isValid = await form.trigger(fields, { shouldFocus: true })

    if (isValid) {
      setStep(step === 'recipient' ? 'amount' : 'review')
      return
    }

    // Marks the fields as touched, so an error clears as soon as it is fixed
    // instead of staying red until the user leaves the field.
    fields.forEach((name) => {
      form.setValue(name, form.getValues(name), { shouldTouch: true })
    })
  }

  return (
    <dialog
      ref={dialogRef}
      className="transfer-dialog"
      aria-labelledby="transfer-title"
      onCancel={preventCloseWhileSending}
      onClose={handleClose}
    >
      <header className="transfer-header">
        <h2 id="transfer-title">New transfer</h2>
        <button
          type="button"
          className="icon-button"
          aria-label="Close"
          disabled={transfer.isLoading}
          onClick={closeDialog}
        >
          ✕
        </button>
      </header>

      <div aria-live="polite">
        {sent && (
          <SuccessPanel
            transfer={sent}
            titleRef={titleRef}
            onDone={closeDialog}
          />
        )}
      </div>

      {!sent && (
        <FormProvider {...form}>
          <form className="transfer-form" noValidate onSubmit={handleContinue}>
            <div className="transfer-body">
              <Stepper current={step} />
              <h3 ref={titleRef} tabIndex={-1} className="transfer-step-title">
                {STEP_TITLES[step]}
              </h3>

              {step === 'recipient' && <RecipientStep />}
              {step === 'amount' && (
                <AmountStep
                  accounts={fromAccounts}
                  remainingLimit={remainingLimit}
                />
              )}
              {step === 'review' && (
                <ReviewStep
                  accounts={fromAccounts}
                  sendError={sendErrorText(transfer.error)}
                />
              )}
            </div>

            <footer ref={footerRef} className="transfer-footer">
              {step === 'recipient' ? (
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={closeDialog}
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  className="button button-secondary"
                  disabled={transfer.isLoading}
                  onClick={goBack}
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                className="button button-primary"
                disabled={transfer.isLoading}
              >
                {step !== 'review' && 'Continue'}
                {step === 'review' &&
                  (transfer.isLoading ? 'Sending…' : 'Confirm transfer')}
              </button>
            </footer>
          </form>
        </FormProvider>
      )}
    </dialog>
  )
}