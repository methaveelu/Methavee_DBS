import { Dashboard } from "./features/dashboard/Dashboard"
import { Header } from "./features/headers/Header"

export default function App() {

  return (
    <div className="starter">
      <header className="starter-header">
        <strong>Meridian</strong>
      </header>

      <main className="starter-main">
        <Header />
        <Dashboard/>
      </main>
    </div>
  )
}
