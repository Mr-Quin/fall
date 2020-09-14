import React from 'react'
import styled from 'styled-components'
import { Color3, GlowLayer, PointerEventTypes } from '@babylonjs/core'
import SceneComponent from './SceneComponent'
import Constellation from '../models/Constellation'
import { Transport } from 'tone'
import { Chord } from '@tonaljs/tonal'
import Environment from '../models/Environment'

const StyledScene = styled(SceneComponent)`
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
`

const onSceneReady = (scene) => {
    Transport.bpm.value = 60
    Transport.start()

    const canvas = scene.getEngine().getRenderingCanvas()
    const environment = new Environment(scene, canvas)
    environment.createCamera().createLight().createGround()
    environment.sceneColor = Color3.Black()

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
}

const onRender = (scene) => {
    const deltaTimeInMillis = scene.getEngine().getDeltaTime()

    const rpm = 60
    const rate = (rpm / 60) * Math.PI * 0.5 * (deltaTimeInMillis / 1000)
}

const SceneViewer = () => (
    <StyledScene antialias onSceneReady={onSceneReady} onRender={onRender} id="my-canvas" />
)

export default SceneViewer
