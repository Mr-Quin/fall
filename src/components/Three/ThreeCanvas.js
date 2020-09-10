import * as THREE from 'three'
import React from 'react'
import { Canvas } from 'react-three-fiber'
import { Stats, Stars, Ring } from 'drei'
import { useMood } from '../Mood'
import Effects from './Effects'
import StarField from './StarField'
import Controls from './Controls'
import Chord from './Chord'
import Colliders from './Colliders'

THREE.Object3D.DefaultUp.set(0, 0, 1)
const ThreeCanvas = ({ ...props }) => {
    console.log('canvas render')
    return (
        <Canvas gl2={true} camera={{ fov: 75, position: [15, 25, 15], focus: 0.1 }}>
            <Controls />
            <Stats />
            {/*<Stars saturation={1} />*/}
            {/*<ambientLight intensity={0.2} />*/}
            <StarField count={5000} />
            <Chord />
            <Ring args={[9.8, 10, 64]}>
                <meshStandardMaterial
                    attach={'material'}
                    color={'lightblue'}
                    emissive={'lightblue'}
                />
            </Ring>
            <Colliders />
            <Effects />
        </Canvas>
    )
}

export default ThreeCanvas
