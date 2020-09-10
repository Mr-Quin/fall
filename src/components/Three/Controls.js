import React from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'drei'
import { useFrame, useThree } from 'react-three-fiber'

const Controls = ({ ...props }) => {
    const { camera, mouse } = useThree()

    useFrame(() => {
        // camera.position.x += mouse.x
        // camera.position.y += mouse.y
    })

    return (
        <OrbitControls
            mouseButtons={{
                LEFT: undefined,
                MIDDLE: THREE.MOUSE.ZOOM,
                RIGHT: THREE.MOUSE.ROTATE,
            }}
        />
    )
}

export default Controls
