import React, { useCallback, useEffect, useMemo, useReducer, useState } from 'react'
import * as THREE from 'three'
import Grid from './Grid'
import useHover from '../../hooks/useHover'
import useDrag from '../../hooks/useDrag'
import { useThree } from 'react-three-fiber'

const String = ({ dStart, dEnd, partial, ...props }) => {
    const [start, setStart] = useState(dStart)
    const [end, setEnd] = useState(dEnd)

    const vertices = [start, end]

    useEffect(() => {
        if (partial) {
            setEnd(dEnd)
        }
    }, [dEnd])

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
            <EndPoint
                position={start}
                onDrag={(ray) => setStart(ray.origin.add(ray.direction.multiplyScalar(30)).clone())}
            />
            <EndPoint
                position={end}
                onDrag={(ray) => setEnd(ray.origin.add(ray.direction.multiplyScalar(30)).clone())}
            />
        </>
    )
}

const EndPoint = ({ position, onDrag, onEnd, material, ...props }) => {
    let [bindHover, hovered] = useHover(false)
    let bindDrag = useDrag(onDrag, null, onEnd)

    return (
        <mesh position={position} {...bindDrag} {...bindHover} {...props}>
            <sphereBufferGeometry attach="geometry" args={[0.2, 16, 16]} />
            <meshStandardMaterial
                attach={'material'}
                color={'lightblue'}
                emissive={hovered ? 'hotpink' : 'lightblue'}
                emissiveIntensity={1}
            />
        </mesh>
    )
}

const Chord = () => {
    const [string, setString] = useState([]) //TODO: change to reducer
    const [tempString, setTempString] = useState([])

    const onDragStart = useCallback((ray) => {
        const vec = ray.origin.add(ray.direction.multiplyScalar(30)).clone()
        const points = [vec, vec]
        setTempString(points)
        console.log('Drag Start')
    }, [])

    const onDrag = useCallback((ray) => {
        const vec = ray.origin.add(ray.direction.multiplyScalar(30)).clone()
        setTempString((prevState) => {
            return [prevState[0], vec]
        })
        console.log('Drag')
    }, [])

    const onDragEnd = useCallback((ray) => {
        setTempString((tempPrevState) => {
            setString((prevState) => [...prevState, tempPrevState])
            return []
        })
        console.log('Drag End')
    }, [])

    return (
        <>
            {tempString.length ? (
                <String dStart={tempString[0]} dEnd={tempString[1]} partial />
            ) : null}
            {string.map((vec, i) => {
                return <String dStart={vec[0]} dEnd={vec[1]} key={i} />
            })}

            <Grid onStart={onDragStart} onDrag={onDrag} onEnd={onDragEnd} visible />
        </>
    )
}

export default Chord
