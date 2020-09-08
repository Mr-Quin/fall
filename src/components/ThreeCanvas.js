import * as THREE from 'three'
import React, { useCallback, useEffect, useRef, useMemo, useState } from 'react'
import { Canvas, extend, useFrame, useThree } from 'react-three-fiber'
import { useMood } from './Mood'
import Effects from './Three/Effects'
import StarField from './Three/StarField'
import Controls from './Three/Controls'

const Ring = () => {
    return (
        <mesh>
            <torusBufferGeometry attach={'geometry'} args={[10, 0.1, 4, 30]} />
            <meshStandardMaterial attach={'material'} color={'lightblue'} emissive={'lightblue'} />
        </mesh>
    )
}

const Collider = ({ count = 100 }) => {
    const mesh = useRef()
    const dummy = useMemo(() => new THREE.Object3D(), []) // dummy for instancing
    // generate positions
    const colliders = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100
            temp.push({ t })
        }
        return temp
    }, [count])
    console.log(colliders)
    useFrame((state) => {
        colliders.forEach((particle, i) => {
            let { t } = particle
            particle.t += 0.01
            // Update the dummy object
            dummy.position.set(Math.sin(t / 10) * 5, Math.cos(t / 10) * 2 + Math.sin(t), 0)
            dummy.scale.set(1, 1, 1)
            // dummy.rotation.set(s * 5, s * 5, s * 5)
            dummy.updateMatrix()
            // Apply the matrix to the instanced item
            mesh.current.setMatrixAt(i, dummy.matrix)
        })
        mesh.current.instanceMatrix.needsUpdate = true
    })
    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <dodecahedronBufferGeometry attach={'geometry'} args={[0.5, 0]} />
            <meshPhongMaterial attach={'material'} color={'#050505'} emissive={'lightblue'} />
        </instancedMesh>
    )
}

const ThreeCanvas = ({ ...props }) => {
    const mouse = useRef([0, 0])
    const onMouseMove = useCallback(
        ({ clientX: x, clientY: y }) =>
            (mouse.current = [x - window.innerWidth / 2, y - window.innerHeight / 2]),
        []
    )
    console.log('canvas render')
    return (
        <Canvas
            gl2={true}
            camera={{ fov: 75, position: [0, 0, 20], focus: 0.1 }}
            onMouseMove={onMouseMove}
        >
            <StarField count={5000} mouse={mouse} />
            <Ring />
            <Collider />
            <Controls />
            <Effects />
        </Canvas>
    )
}

export default ThreeCanvas
