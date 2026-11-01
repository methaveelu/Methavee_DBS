import type  {Segment} from '../../api/types'
import {create} from 'zustand'
import {persist} from 'zustand/middleware'
export type Theme = 'light' | 'dark'


interface PreferencesState {
    theme: Theme;
    segment: Segment | null;
    toggleTheme: () => void;
    chooseSegment: (segment: Segment) => void;
}

export const usePreferences = create<PreferencesState>()(
    //saves prefenercne in localstorage, and also fetc before compoent mounts
   persist(
    (set, get)=>({
     theme: document.documentElement.dataset.theme === 'dark'? 'dark' : 'light',
     segment: null,
     toggleTheme: ()=>{
        const newTheme = get().theme === 'dark'? 'light': 'dark';
        document.documentElement.dataset.theme = newTheme;
        set({theme: newTheme});
     },
     chooseSegment:(segment)=>set({segment})
   }),
   {name: 'meridian-preferences'},
   )
)


