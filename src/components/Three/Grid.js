import React, { forwardRef, useRef } from 'react'
import { useThree } from 'react-three-fiber'
import useDrag from '../../hooks/useDrag'

const Grid = forwardRef(({ onDrag, onStart, onEnd, visible = true, ...props }, ref) => {
    const grid = useRef()
    const { raycaster } = useThree()
    const bind = useDrag(onDrag, onStart, onEnd, raycaster.ray)

    return (
        <mesh {...bind} ref={grid}>
            <planeGeometry attach={'geometry'} args={[100, 100, 100, 100]} />
            <meshStandardMaterial
                attach={'material'}
                color={'lightblue'}
                emissive={'lightblue'}
                emissiveIntensity={0.2}
                visible={visible}
                wireframe
            />
        </mesh>
    )
})

export default Grid
