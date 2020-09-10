import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from 'react-three-fiber'
import * as THREE from 'three'
import Grid from './Grid'

const Chord = ({ ...props }) => {
    const grid = useRef()
    const instance = useRef()
    const { raycaster } = useThree()

    const dummy = useMemo(() => new THREE.Object3D(), [])

    const [count, setCount] = useState([]) //TODO: change to reducer
    const scale = 0.2

    const addVec = useCallback((vec) => {
        setCount((prevState) => [...prevState, vec])
    }, [])
    const onUpdate = useCallback((self) => self.setFromPoints(count), [count])

    useFrame((state) => {
        count.forEach((vec, i) => {
            dummy.position.set(vec.x, vec.y, vec.z)
            dummy.scale.set(scale, scale, scale)
            dummy.updateMatrix()
            instance.current.setMatrixAt(i, dummy.matrix)
        })
        instance.current.count = count.length
        instance.current.instanceMatrix.needsUpdate = true
    })

    return (
        <>
            <line>
                <bufferGeometry attach="geometry" onUpdate={onUpdate} />
                <lineBasicMaterial
                    attach="material"
                    color={'#ffffff'}
                    linewidth={10}
                    linecap={'round'}
                    linejoin={'round'}
                />
            </line>
            <instancedMesh ref={instance} args={[null, null, 1000]}>
                <sphereBufferGeometry attach={'geometry'} args={[1, 8, 8]} />
                <meshStandardMaterial
                    attach={'material'}
                    color={'lightblue'}
                    emissive={'lightblue'}
                    emissiveIntensity={1}
                />
            </instancedMesh>
            <Grid onClick={addVec} visible />
        </>
    )
}

export default Chord
