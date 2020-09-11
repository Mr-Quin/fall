import { useCallback, useState } from 'react'

const useHover = (stopPropagation = true) => {
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
