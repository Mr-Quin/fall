import React, { useCallback, useMemo, useRef, useState } from 'react'
import { useFrame } from 'react-three-fiber'
import * as THREE from 'three'
import Grid from './Grid'
import { chunk } from '../../utils/utils'

const String = ({ dStart, dEnd, ...props }) => {
    const [start, setStart] = useState(dStart)
    const [end, setEnd] = useState(dEnd)
    const vertices = useMemo(() => [start, end].map((vec) => new THREE.Vector3(...vec)), [
        start,
        end,
    ])
    const update = useCallback(
        (self) => ((self.verticesNeedUpdate = true), self.computeBoundingSphere()),
        []
    )
    return (
        <>
            <line>
                <geometry attach="geometry" vertices={vertices} onUpdate={update} />
                <lineBasicMaterial attach="material" color="white" />
            </line>
            <group>
                <mesh position={start}>
                    <sphereBufferGeometry attach="geometry" args={[0.2, 16, 16]} />
                    <meshStandardMaterial
                        attach={'material'}
                        color={'lightblue'}
                        emissive={'lightblue'}
                        emissiveIntensity={1}
                    />
                </mesh>
                <mesh position={end}>
                    <sphereBufferGeometry attach="geometry" args={[0.2, 16, 16]} />
                    <meshStandardMaterial
                        attach={'material'}
                        color={'lightblue'}
                        emissive={'lightblue'}
                        emissiveIntensity={1}
                    />
                </mesh>
            </group>
        </>
    )
}

const Chord = ({ ...props }) => {
    const [count, setCount] = useState([]) //TODO: change to reducer

    const addVec = useCallback((ray) => {
        const vec = ray.origin.add(ray.direction.multiplyScalar(30))
        setCount((prevState) => [...prevState, vec.clone()])
    }, [])

    return (
        <>
            {count.length % 2 === 0
                ? chunk(count, 2).map((vec, i) => {
                      return <String dStart={vec[0].toArray()} dEnd={vec[1].toArray()} key={i} />
                  })
                : null}

            <Grid onStart={addVec} onDrag={addVec} visible />
        </>
    )
}

export default Chord
