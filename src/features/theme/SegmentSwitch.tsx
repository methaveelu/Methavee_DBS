import { useEffect } from 'react';
import type { Segment } from '../../api/types';
import {usePreferences} from './usePreferences';

const SEGMENT: {value: Segment; label: string}[]=[
    {value: 'retail', label: 'Retail'},
    {value: 'premium', label: 'Premium'},
]

interface SegmentSwitchProps{
    defaultSegment?: Segment;
}
export const SegmentSwitch = ({defaultSegment}: SegmentSwitchProps)=>{
    const chosen = usePreferences((state)=> state.segment);
    const chooseSegment = usePreferences((state)=> state.chooseSegment);
    const segment  = chosen ?? defaultSegment ?? 'retail';
    useEffect(()=>{
        document.documentElement.dataset.segment = segment;
    },[segment])
    
    return(
        <div className='segment-switch' aria-label='Segment switch'>
            {SEGMENT.map(({value, label})=>(
                <button 
                    key={value}
                    type='button'
                    onClick={()=> chooseSegment(value)}
                    aria-pressed={segment === value}
                >
                    {label}
                </button>
            ))}
        </div>
    )
}