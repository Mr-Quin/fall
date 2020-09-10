import React, { useMemo, useRef } from 'react'
import { extend, useFrame, useThree } from 'react-three-fiber'
import * as THREE from 'three'
import { shaderMaterial } from 'drei'

const StarMaterial = shaderMaterial(
    {},
    `varying vec3 vColor;
void main() {
    vColor = color;
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0);
}
`,
    `varying vec3 vColor;
void main() {
    gl_FragColor = vec4(vColor, 1.0);
}
`
)

extend({ StarMaterial })

const StarField = ({ count = 1000 }) => {
    const mesh = useRef()

    const dummyObj = useMemo(() => new THREE.Object3D(), [])
    const dummyColor = useMemo(() => new THREE.Color(), [])

    // Generate some random positions, speed factors and timings
    const [particles, colors, positions] = useMemo(() => {
        const temp = []
        const colors = []
        const positions = []
        for (let i = 0; i < count; i++) {
            const t = Math.random() * 100
            const scale = Math.max(Math.random(), 0.3)
            const factor = 20 + Math.random() * 100
            const speed = 0.01 + Math.random() / 400
            const xFactor = -50 + Math.random() * 100
            const yFactor = -50 + Math.random() * 100
            const zFactor = -50 + Math.random() * 100
            temp.push({ t, scale, factor, speed, xFactor, yFactor, zFactor })

            dummyColor.setHSL(i / count, 0.9, 0.9)
            colors.push(dummyColor.r, dummyColor.g, dummyColor.b)
        }
        return [temp, new Float32Array(colors), new Float32Array(positions)]
    }, [count])

    useFrame((state) => {
        // Run through the randomized data to calculate some movement
        particles.forEach((particle, i) => {
            let { t, scale, factor, speed, xFactor, yFactor, zFactor } = particle

            t = particle.t += speed / 200
            const a = Math.cos(t) + Math.sin(t * 1) / 10
            const b = Math.sin(t) + Math.cos(t * 2) / 10

            // Update the dummy object
            dummyObj.position.set(
                xFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
                yFactor + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
                zFactor + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
            )
            dummyObj.scale.set(scale, scale, scale)
            dummyObj.updateMatrix()

            mesh.current.setMatrixAt(i, dummyObj.matrix)
            mesh.current.rotation.z += 0.00000002
        })
        mesh.current.instanceMatrix.needsUpdate = true
    })

    const uniforms = useMemo(() => {}, [])

    return (
        <>
            <instancedMesh ref={mesh} args={[null, null, count]}>
                <dodecahedronBufferGeometry attach="geometry" args={[0.1, 0]}>
                    <bufferAttribute attachObject={['attributes', 'color']} args={[colors, 3]} />
                </dodecahedronBufferGeometry>
                {/*<meshPhongMaterial attach={'material'} vertexColors />*/}
                <starMaterial attach={'material'} vertexColors />
            </instancedMesh>
        </>
    )
}

export default StarField
