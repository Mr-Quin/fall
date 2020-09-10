import * as THREE from 'three'
import React, { Suspense, useCallback, useEffect, useRef, useMemo, useState } from 'react'
import { Canvas, extend, useFrame, useThree } from 'react-three-fiber'
import { Stats, Stars } from 'drei'
import { useMood } from '../Mood'
import Effects from './Effects'
import StarField from './StarField'
import Controls from './Controls'
import Chord from './Chord'
import Colliders from './Colliders'

const Ring = () => {
    return (
        <mesh>
            <ringBufferGeometry attach={'geometry'} args={[9.8, 10, 64]} />
            <meshStandardMaterial attach={'material'} color={'lightblue'} emissive={'lightblue'} />
        </mesh>
    )
}

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
            <Ring />
            <Colliders />
            <Effects />
        </Canvas>
    )
}

export default ThreeCanvas
