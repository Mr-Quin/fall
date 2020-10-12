/*
    Taken from the BabylonJS React snippet. Added static typing.
 */
import { Engine, EngineOptions, Scene, SceneOptions } from '@babylonjs/core'
import React, { CanvasHTMLAttributes, DetailedHTMLProps, useEffect, useRef, useState } from 'react'

interface SceneProps
    extends DetailedHTMLProps<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement> {
    antialias?: boolean
    engineOptions?: EngineOptions
    sceneOptions?: SceneOptions
    adaptToDeviceRatio?: boolean
    onSceneReady?: (scene: Scene) => void
    onRender?: (scene: Scene) => void
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

    const reactCanvas = useRef<any>()

    const [loaded, setLoaded] = useState<boolean>(false)
    const [scene, setScene] = useState<Scene>()

    useEffect(() => {
        if (window) {
            const resize = () => {
                if (scene) {
                    // @ts-ignore
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
            const engine = new Engine(
                reactCanvas.current,
                antialias,
                engineOptions,
                adaptToDeviceRatio
            )
            const scene = new Scene(engine, sceneOptions)
            setScene(scene)
            if (scene.isReady()) {
                onSceneReady!(scene)
            } else {
                scene.onReadyObservable.addOnce((scene) => onSceneReady!(scene))
            }

            engine.runRenderLoop(() => {
                onRender!(scene)
                scene.render()
            })
        }

        return () => {
            if (scene !== null) {
                scene!.dispose()
            }
        }
    }, [reactCanvas])

    return <canvas ref={reactCanvas} {...rest} />
}

export default SceneComponent
