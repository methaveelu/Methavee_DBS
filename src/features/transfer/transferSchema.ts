import { z } from 'zod'
import type { Account, CreateTransferRequest } from '../../api/types'
import { formatMoney } from '../../lib/format'

// extra radio button to enable the new recipient fields.
export const NEW_RECIPIENT = 'new'
export const NOTE_MAX_LENGTH = 50
export const BANKS = ['DBS', 'OCBC', 'UOB', 'Standard Chartered', 'HSBC', 'Maybank']

export interface TransferRules {
  accounts: Account[]
  remainingLimit: number
}

function amountError(
  amount: string,
  account: Account | undefined,
  remainingLimit: number,
): string | null {
  const value = amount.trim()

  if (value === '') return 'Enter  amount.'
  if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    return 'Enter a number with at most 2 decimal places.'
  }
  if (Number(value) < 1) return `Enter at least ${formatMoney(1)}.`
  if (account && Number(value) > account.balance) {
    return `Amount can't be more than your available balance (${formatMoney(account.balance)}).`
  }
  if (Number(value) > remainingLimit) {
    return `This transfer exceeds your remaining daily limit (${formatMoney(remainingLimit)}).`
  }
  return null
}

export function makeTransferSchema({ accounts, remainingLimit }: TransferRules) {
  return z
    .object({
      payeeId: z.string(),
      newName: z.string(),
      newAccountNumber: z.string(),
      newBank: z.string(),
      fromAccountId: z.string(),
      amount: z.string(),
      note: z.string(),
    })
    .superRefine((values, context) => {
      function fail(field: keyof typeof values, message: string) {
        context.addIssue({ code: 'custom', path: [field], message })
      }

      if (values.payeeId === '') fail('payeeId', 'Choose who to send to.')

      if (values.payeeId === NEW_RECIPIENT) {
        const name = values.newName.trim()
        if (name.length < 2 || name.length > 50) {
          fail('newName', 'Enter a name between 2 and 50 characters.')
        }
        if (!/^\d{8}$/.test(values.newAccountNumber.trim())) {
          fail('newAccountNumber', 'Enter a valid 8-digit account number.')
        }
        if (values.newBank === '') fail('newBank', 'Choose a bank.')
      }

      const account = accounts.find(({ id }) => id === values.fromAccountId)
      if (!account) fail('fromAccountId', 'Choose an account to send from.')

      const amountProblem = amountError(values.amount, account, remainingLimit)
      if (amountProblem) fail('amount', amountProblem)

      if (values.note.length > NOTE_MAX_LENGTH) {
        fail('note', `Keep the note to ${NOTE_MAX_LENGTH} characters or fewer.`)
      }
    })
}

export type TransferFormValues = z.infer<ReturnType<typeof makeTransferSchema>>

export function toTransferRequest(
  values: TransferFormValues,
): CreateTransferRequest {
  const request = {
    fromAccountId: values.fromAccountId,
    amount: Number(values.amount.trim()),
    note: values.note === '' ? undefined : values.note,
  }

  if (values.payeeId === NEW_RECIPIENT) {
    return {
      ...request,
      recipient: {
        name: values.newName.trim(),
        accountNumber: values.newAccountNumber.trim(),
        bank: values.newBank,
      },
    }
  }

  return { ...request, payeeId: values.payeeId }
}