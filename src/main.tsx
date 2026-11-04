import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { Provider}  from 'react-redux'
import { setupListeners } from '@reduxjs/toolkit/query/react'
import { makeStore } from './store'

async function enableMocking() {
  const { worker } = await import('./mocks/browser')
  await Promise.race([
    worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: `${import.meta.env.BASE_URL}mockServiceWorker.js`,
      },
    }),
    new Promise<never>((_, reject) => {
      window.setTimeout(
        () => reject(new Error('Timed out starting the mock worker')),
        2500,
      )
    }),
  ])
}

async function bootstrap() {
  try {
    await enableMocking()
  } catch (error) {
    // Render anyway so the error is visible instead of a blank page.
    console.error(
      'Mock API failed to start. Check that public/mockServiceWorker.js exists.',
      error,
    )
  }

   // Creates the Redux store, which holds the RTK Query cache.
  const store = makeStore()
  // Lets refetchOnFocus and refetchOnReconnect hear the browser's events.
  setupListeners(store.dispatch)

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <Provider store={store}>
          <App />
      </Provider>
    </StrictMode>,
  )
}

void bootstrap()
