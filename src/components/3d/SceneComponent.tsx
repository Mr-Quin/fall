/*
    Taken from the BabylonJS React snippet. Added static typing.
 */
import * as BABYLON from '@babylonjs/core'
import React, { CanvasHTMLAttributes, DetailedHTMLProps, useEffect, useRef, useState } from 'react'

interface SceneProps
    extends DetailedHTMLProps<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement> {
    antialias?: boolean
    engineOptions?: BABYLON.EngineOptions
    sceneOptions?: BABYLON.SceneOptions
    adaptToDeviceRatio?: boolean
    onSceneReady: (scene: BABYLON.Scene) => void
    onRender: (scene: BABYLON.Scene) => void
}

const SceneComponent = (props: SceneProps) => {
    const {
        antialias,
        engineOptions,
        adaptToDeviceRatio,
        sceneOptions,
        onRender,
        onSceneReady,
        ...rest
    } = props

    const canvas = useRef<any>()

    const [loaded, setLoaded] = useState<boolean>(false)
    const [scene, setScene] = useState<BABYLON.Scene>()

    useEffect(() => {
        if (window) {
            const resize = () => {
                if (scene) {
                    scene.getEngine().resize()
                }
            }
            window.addEventListener('resize', resize)

            return () => {
                window.removeEventListener('resize', resize)
            }
        }
    }, [scene])

    useEffect(() => {
        if (!loaded) {
            setLoaded(true)
            const engine = new BABYLON.Engine(
                canvas.current,
                antialias,
                engineOptions,
                adaptToDeviceRatio
            )
            const scene = new BABYLON.Scene(engine, sceneOptions)
            setScene(scene)
            if (scene.isReady()) {
                onSceneReady(scene)
            } else {
                scene.onReadyObservable.addOnce((scene) => onSceneReady(scene))
            }

            engine.runRenderLoop(() => {
                onRender(scene)
                scene.render()
            })
        }

        return () => {
            if (scene !== null) {
                scene!.dispose()
            }
        }
    }, [canvas])

    return <canvas ref={canvas} {...rest} />
}

export default SceneComponent
