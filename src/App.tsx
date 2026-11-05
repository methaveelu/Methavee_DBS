import { Dashboard } from "./features/dashboard/Dashboard"
import { Header } from "./features/headers/Header"

export default function App() {
  return (
    <>
      <Header />
      <main className="page">
        <Dashboard />
      </main>
    </>
  )
}
