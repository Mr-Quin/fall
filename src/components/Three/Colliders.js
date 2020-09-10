import React, { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from 'react-three-fiber'

const Colliders = ({ count = 100 }) => {
    const mesh = useRef()
    const dummy = useMemo(() => new THREE.Object3D(), []) // dummy for instancing

    // generate positions
    const colliders = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            const factor = Math.random() * 100
            temp.push({ factor })
        }
        return temp
    }, [count])

    useFrame((state) => {
        colliders.forEach((particle, i) => {
            let { factor } = particle
            particle.factor += 0.01
            // Update the dummy object
            dummy.position.set(
                Math.sin(factor / 2) * 5 + Math.cos(factor / 10),
                Math.cos(factor / 5) * 5 + Math.sin(factor / 2),
                Math.cos(factor / 10) * 5 + Math.sin(factor / 5)
            )
            dummy.updateMatrix()
            mesh.current.setMatrixAt(i, dummy.matrix)
        })
        mesh.current.instanceMatrix.needsUpdate = true
    })
    return (
        <instancedMesh ref={mesh} args={[null, null, count]}>
            <dodecahedronBufferGeometry attach={'geometry'} args={[0.5, 0]} />
            <meshPhongMaterial
                attach={'material'}
                color={'#050505'}
                emissive={'lightblue'}
                emissiveIntensity={0.5}
            />
        </instancedMesh>
    )
}

export default Colliders
