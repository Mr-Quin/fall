import { useCallback, useState } from 'react'

interface useHoverFunc {
    (stopPropagation: boolean): any
}

const useHover: useHoverFunc = (stopPropagation = true) => {
    const [hovered, setHover] = useState(false)
    const hover = useCallback((e) => {
        if (stopPropagation) e.stopPropagation()
        setHover(true)
    }, [])
    const unhover = useCallback((e) => {
        if (stopPropagation) e.stopPropagation()
        setHover(false)
    }, [])
    const [bind] = useState(() => ({ onPointerOver: hover, onPointerOut: unhover }))
    return [bind, hovered]
}

export default useHover
