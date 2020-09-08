import React, { useCallback, useRef, useState } from 'react'

const Chord = ({ ...props }) => {
    const mesh = useRef()
    const [count, setCount] = useState(0)
    const onMouseDown = useCallback((e) => {
        setCount((prevState) => prevState + 1)
    }, [])

    return (
        <mesh>
            <torusBufferGeometry attach={'geometry'} args={[10, 0.1, 4, 30]} />
            <meshStandardMaterial attach={'material'} color={'lightblue'} emissive={'lightblue'} />
        </mesh>
    )
}
