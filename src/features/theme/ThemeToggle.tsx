import {usePreferences} from './usePreferences';

export const ThemeToggle = ()=>{
    const isDark = usePreferences((state)=>state.theme === 'dark');
    const toggle = usePreferences((state)=>state.toggleTheme);

    return(
        <button
            className='icon-button'
            aria-label = "Dark mode"
            aria-pressed = {isDark}
            onClick = {toggle}
        >
            <svg width='40' height='40' viewBox='1 1 24 24' fill='none' aria-hidden='true'>
                {isDark? (
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor"/>
                ):(<path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" fill="currentColor"/>)}
            </svg>
        </button>
    )
}