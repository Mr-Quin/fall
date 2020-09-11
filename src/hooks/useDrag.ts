import { useCallback, useEffect, useRef, useState } from 'react'
import { useThree } from 'react-three-fiber'

interface useDragFunc {
    (onDrag: Function, onStart?: Function, onEnd?: Function, returnValue?: any): any
}

const useDrag: useDragFunc = (onDrag, onStart, onEnd, returnValue = null) => {
    const [active, setActive] = useState(false)
    const activeRef = useRef(false)
    const { raycaster } = useThree()

    useEffect(() => void (activeRef.current = active))

    const down = useCallback(
        (e) => {
            if (e.button !== 0) return
            setActive(true)
            e.stopPropagation()
            if (onStart) onStart(raycaster.ray)
        },
        [onStart, returnValue]
    )

    const up = useCallback(
        (e) => {
            if (e.button !== 0) return
            setActive(false)
            e.stopPropagation()
            if (onEnd) onEnd(raycaster.ray)
        },
        [onEnd, returnValue]
    )

    const move = useCallback(
        (e) => {
            if (e.buttons !== 1) return
            if (activeRef.current) {
                e.stopPropagation()
                onDrag(raycaster.ray)
            }
        },
        [onDrag, returnValue]
    )

    const [bind] = useState(() => ({ onPointerDown: down, onPointerUp: up, onPointerMove: move }))
    return bind
}

export default useDrag
