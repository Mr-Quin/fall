import React, { useCallback, useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { Color3, GlowLayer, PointerEventTypes } from '@babylonjs/core'
import SceneComponent from './SceneComponent'
import Environment from '../models/Environment'
import { useMood } from './Mood'
import { Transport } from 'tone'
import Space from '../models/Space'

const StyledScene = styled(SceneComponent)`
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
`

const StyledStat = styled.div`
    color: white;
    position: absolute;
`

const SceneViewer = ({ ...props }) => {
    const mood = useMood()

    const environmentRef = useRef<any>()
    const spaceRef = useRef<any>()
    const fpsRef = useRef<any>()

    useEffect(() => {
        spaceRef.current.keys = mood.keys
        console.log(spaceRef)
    }, [mood])

    useEffect(() => {
        environmentRef.current.createCamera().createLight().createGround().createEffects()
        environmentRef.current.sceneColor = Color3.Black()
        environmentRef.current.enableDebugMetrics()
    }, [environmentRef])

    const onSceneReady = useCallback((scene) => {
        const canvas = scene.getEngine().getRenderingCanvas()
        environmentRef.current = new Environment(scene, canvas)
        spaceRef.current = new Space(scene)
        spaceRef.current.addConstellation([
            [4, 5],
            [2, 5],
            [2, 3, 5],
            [],
            [2, 6, 4],
            [2, 6, 4],
            [],
            [2, 3, 5],
        ])
        setTimeout(() => {
            spaceRef.current.startTransport()
        }, 1000)
    }, [])

    const onRender = useCallback((scene) => {
        fpsRef.current.innerHTML = `FPS: ${scene.getEngine().getFps().toFixed()}`
    }, [])

    console.log('canvas render')

    return (
        <>
            <StyledStat ref={fpsRef} />
            <StyledScene antialias onSceneReady={onSceneReady} onRender={onRender} id="my-canvas" />
        </>
    )
}

export default SceneViewer
