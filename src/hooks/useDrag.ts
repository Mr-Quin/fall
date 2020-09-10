import { useCallback, useEffect, useRef, useState } from 'react'

const useDrag = (onDrag, onStart, onEnd, returnValue = null): any => {
    const [active, setActive] = useState(false)
    const activeRef = useRef(false)

    useEffect(() => void (activeRef.current = active))

    const down = useCallback(
        (e) => {
            if (e.buttons !== 1) return
            setActive(true)
            e.stopPropagation()
            if (onStart) onStart(returnValue)
            // e.target.setPointerCapture(e.pointerId)
        },
        [onStart, returnValue]
    )

    const up = useCallback(
        (e) => {
            if (e.buttons !== 1) return
            setActive(false)
            e.stopPropagation()
            // e.target.releasePointerCapture(e.pointerId)
            if (onEnd) onEnd(returnValue)
        },
        [onEnd, returnValue]
    )

    const move = useCallback(
        (e) => {
            if (e.buttons !== 1) return
            if (activeRef.current) {
                e.stopPropagation()
                onDrag(returnValue)
            }
        },
        [onDrag, returnValue]
    )

    const [bind] = useState(() => ({ onPointerDown: down, onPointerUp: up, onPointerMove: move }))
    return bind
}

export default useDrag
