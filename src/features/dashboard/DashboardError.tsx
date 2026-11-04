interface DashboardErrorProps {
  onRetry: () => void
}

export function DashboardError({ onRetry }: DashboardErrorProps) {
  return (
    <section className="card dashboard-error" role="alert">
      <p>We couldn't load your dashboard.</p>
      <button type="button" className="button button-primary" onClick={onRetry}>
        Retry
      </button>
    </section>
  )
}