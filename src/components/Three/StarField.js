import React, { useMemo, useRef } from 'react'
import { useFrame, useThree } from 'react-three-fiber'
import * as THREE from 'three'

const StarField = ({ count = 1000, mouse }) => {
    const mesh = useRef()

    const dummy = useMemo(() => new THREE.Object3D(), [])

    // Generate some random positions, speed factors and timings
    const particles = useMemo(() => {
        const temp = []
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100
            const scale = Math.max(Math.random(), 0.3)
            const factor = 20 + Math.random() * 100
            const speed = 0.01 + Math.random() / 400
            const xFactor = -50 + Math.random() * 100
            const yFactor = -50 + Math.random() * 100
            const zFactor = -50 + Math.random() * 100
            temp.push({ t, scale, factor, speed, xFactor, yFactor, zFactor, mx: 0, my: 0 })
        }
        return temp
    }, [count])

    useFrame((state) => {
        // Run through the randomized data to calculate some movement
        particles.forEach((particle, i) => {
            let { t, scale, factor, speed, xFactor, yFactor, zFactor } = particle

            t = particle.t += speed / 200
            const a = Math.cos(t) + Math.sin(t * 1) / 10
            const b = Math.sin(t) + Math.cos(t * 2) / 10
            // particle.mx += (mouse.current[0] - particle.mx) * 0.01
            // particle.my += (mouse.current[1] * -1 - particle.my) * 0.01
            // Update the dummy object
            dummy.position.set(
                (particle.mx / 10) * a +
                    xFactor +
                    Math.cos((t / 10) * factor) +
                    (Math.sin(t * 1) * factor) / 10,
                (particle.my / 10) * b +
                    yFactor +
                    Math.sin((t / 10) * factor) +
                    (Math.cos(t * 2) * factor) / 10,
                (particle.my / 10) * b +
                    zFactor +
                    Math.cos((t / 10) * factor) +
                    (Math.sin(t * 3) * factor) / 10
            )
            dummy.scale.set(scale, scale, scale)
            dummy.updateMatrix()
            // And apply the matrix to the instanced item
            mesh.current.setMatrixAt(i, dummy.matrix)
        })
        mesh.current.instanceMatrix.needsUpdate = true
    })
    return (
        <>
            <instancedMesh ref={mesh} args={[null, null, count]}>
                <dodecahedronBufferGeometry attach="geometry" args={[0.1, 0]} />
                <meshPhongMaterial attach="material" color={'#050505'} emissive={'#ffffff'} />
            </instancedMesh>
        </>
    )
}

export default StarField
