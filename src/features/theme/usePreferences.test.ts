import { beforeEach, describe, expect, it } from 'vitest'
import { usePreferences } from './usePreferences'

const STORAGE_KEY = 'meridian-preferences'

function saved() {
  const raw = localStorage.getItem(STORAGE_KEY)
  return raw ? (JSON.parse(raw) as { state: Record<string, unknown> }).state : null
}

describe('usePreferences (TH1, TH2)', () => {
  beforeEach(() => {
    localStorage.clear()
    // Back to the state a fresh page load starts with.
    usePreferences.setState(usePreferences.getInitialState(), true)
    // What the no-flash script in index.html set from the system setting.
    document.documentElement.dataset.theme = 'dark'
  })

  it('does not save a theme when only the segment is chosen', () => {
    usePreferences.getState().chooseSegment('premium')

    // With no saved theme, the next visit follows the system setting again.
    expect(saved()).toMatchObject({ theme: null, segment: 'premium' })
  })

  it('saves the theme once the user presses the toggle', () => {
    usePreferences.getState().toggleTheme()

    expect(document.documentElement.dataset.theme).toBe('light')
    expect(saved()).toMatchObject({ theme: 'light' })
  })

  it('toggles from what is on screen when nothing has been chosen yet', () => {
    document.documentElement.dataset.theme = 'light'

    usePreferences.getState().toggleTheme()

    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(saved()).toMatchObject({ theme: 'dark' })
  })
})
