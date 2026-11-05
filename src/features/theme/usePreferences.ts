import type  {Segment} from '../../api/types'
import {create} from 'zustand'
import {persist} from 'zustand/middleware'
export type Theme = 'light' | 'dark'

// What is on screen right now. The no-flash script in index.html sets it
// before React loads: the saved choice, or else the system setting.
export function themeOnScreen(): Theme {
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
}

interface PreferencesState {
    // Only the user's own choice. null means they never pressed the toggle, so
    // nothing is saved and the next visit follows the system setting (TH1).
    theme: Theme | null;
    segment: Segment | null;
    toggleTheme: () => void;
    chooseSegment: (segment: Segment) => void;
}

export const usePreferences = create<PreferencesState>()(
    //saves preferences in localStorage; index.html reads them before first paint
   persist(
    (set, get)=>({
     theme: null,
     segment: null,
     toggleTheme: ()=>{
        const current = get().theme ?? themeOnScreen();
        const newTheme = current === 'dark'? 'light': 'dark';
        document.documentElement.dataset.theme = newTheme;
        set({theme: newTheme});
     },
     chooseSegment:(segment)=>set({segment})
   }),
   {name: 'meridian-preferences'},
   )
)
