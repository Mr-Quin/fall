import React, { useCallback, forwardRef, useRef } from 'react'
import { useThree } from 'react-three-fiber'

const Grid = forwardRef(({ onClick, visible = true, ...props }, ref) => {
    const grid = useRef()
    const { raycaster } = useThree()

    const onMouseDown = useCallback(
        (e) => {
            const intersects = raycaster.intersectObject(grid.current)
            const intersectionVec = intersects[0].point
            onClick(intersectionVec)
        },
        [onClick]
    )

    return (
        <mesh onClick={onMouseDown} ref={grid}>
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
