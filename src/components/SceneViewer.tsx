import React, { useCallback, useEffect, useRef } from 'react'
import styled from 'styled-components'
import { Color3, GlowLayer, PointerEventTypes } from '@babylonjs/core'
import SceneComponent from './SceneComponent'
import Environment from '../models/Environment'
import { useMood } from './Mood'
import { Transport } from 'tone'

const StyledScene = styled(SceneComponent)`
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
`

const SceneViewer = ({ ...props }) => {
    const mood = useMood()

    const environment = useRef<any>()

    useEffect(() => {
        environment.current.keys = mood.keys
    }, [mood])

    const onSceneReady = useCallback((scene) => {
        const canvas = scene.getEngine().getRenderingCanvas()
        environment.current = new Environment(scene, canvas)
        environment.current.createCamera().createLight().createGround()
        environment.current.sceneColor = Color3.Black()

        const glow = new GlowLayer('glow', scene, { mainTextureSamples: 2 })

        scene.onPointerObservable.add((pointerInfo) => {
            const { type, event } = pointerInfo
            switch (type) {
                case PointerEventTypes.POINTERDOWN:
                    console.log('POINTER DOWN')
                    break
                case PointerEventTypes.POINTERUP:
                    console.log('POINTER UP')
                    break
                case PointerEventTypes.POINTERMOVE:
                    console.log('POINTER MOVE')
                    break
                case PointerEventTypes.POINTERWHEEL:
                    console.log('POINTER WHEEL')
                    break
                case PointerEventTypes.POINTERPICK:
                    console.log('POINTER PICK')
                    break
                case PointerEventTypes.POINTERTAP:
                    console.log('POINTER TAP')
                    break
                case PointerEventTypes.POINTERDOUBLETAP:
                    console.log('POINTER DOUBLE-TAP')
                    break
            }
        })
    }, [])

    const onRender = useCallback((scene) => {}, [])

    return <StyledScene antialias onSceneReady={onSceneReady} onRender={onRender} id="my-canvas" />
}

export default SceneViewer
