export type TransferStep = 'recipient' | 'amount' | 'review'

const STEPS: { step: TransferStep; label: string }[] = [
  { step: 'recipient', label: 'Recipient' },
  { step: 'amount', label: 'Amount' },
  { step: 'review', label: 'Review' },
]

interface StepperProps {
  current: TransferStep
}

export function Stepper({ current }: StepperProps) {
  return (
    <ol className="stepper">
      {STEPS.map(({ step, label }, index) => (
        <li key={step} aria-current={step === current ? 'step' : undefined}>
          <span className="stepper-number">{index + 1}</span> {label}
        </li>
      ))}
    </ol>
  )
}