import { useRef } from 'react'
import { useFrame } from 'react-three-fiber'

const useWobble = (factor = 1, fn = 'sin', callback) => {
    const ref = useRef()
    useFrame((state) => {
        const time = state.clock.getElapsedTime()
        // @ts-ignore
        ref.current.position.y = Math[fn](time) * factor
        if (callback) callback(time, ref.current)
    })
    return ref
}

export default useWobble
