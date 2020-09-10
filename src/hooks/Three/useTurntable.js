import { useRef } from 'react'
import { useFrame } from 'react-three-fiber'

function useTurntable(axis = 'y', rate = 0.01) {
    const ref = useRef()
    useFrame(() => {
        ref.current.rotation[axis] += rate
    })

    return ref
}

export default useTurntable
