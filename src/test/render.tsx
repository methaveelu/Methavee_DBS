import { getDefaultNormalizer, render } from '@testing-library/react'
import userEvent, { PointerEventsCheckLevel } from '@testing-library/user-event'
import { Provider } from 'react-redux'
import App from '../App'
import { makeStore } from '../store'

// Renders the whole app with a fresh store, so cached API data can't leak from
// one test to the next.
export function renderApp() {
  // TransferDialog switches off mouse clicks on its footer for 500 ms after each
  // step, so a double click can't skip the review. userEvent refuses to click
  // anything with pointer-events: none, so that check is turned off here.
  const user = userEvent.setup({
    pointerEventsCheck: PointerEventsCheckLevel.Never,
  })

  return {
    user,
    ...render(
      <Provider store={makeStore()}>
        <App />
      </Provider>,
    ),
  }
}

// formatMoney puts a non-breaking space after "SGD". By default getByText turns
// that into a normal space on the page side only, so money never matches.
// Pass this as the options to match the text exactly instead.
export const exactText = {
  normalizer: getDefaultNormalizer({ collapseWhitespace: false }),
}
