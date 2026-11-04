interface SkeletonProps {
    width?: string
    height?: string
}

export const Skeleton = ({ width = '100%', height = '1em' }: SkeletonProps) => (
    <span className='skeleton' style={{ width, height }} aria-hidden='true' />
)
