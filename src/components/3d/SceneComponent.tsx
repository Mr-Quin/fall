/*
    Taken from the BabylonJS React snippet. Added static typing.
 */
import React, { CanvasHTMLAttributes, DetailedHTMLProps, useEffect, useRef, useState } from 'react'
import { EngineOptions, SceneOptions } from '@babylonjs/core'
import { Scene } from '@babylonjs/core/scene'
import { Engine } from '@babylonjs/core/Engines/engine'

interface SceneProps
    extends DetailedHTMLProps<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement> {
    antialias?: boolean
    engineOptions?: EngineOptions
    sceneOptions?: SceneOptions
    adaptToDeviceRatio?: boolean
    onSceneReady?: (scene: Scene) => Promise<any>
    onRender?: (scene: Scene) => void
}

export const initScene = async (
    canvas: HTMLCanvasElement,
    props: SceneProps
): Promise<[Engine, Scene]> => {
    const {
        antialias,
        engineOptions,
        adaptToDeviceRatio,
        sceneOptions,
        onRender,
        onSceneReady,
    } = props

    const engine = new Engine(canvas, antialias, engineOptions, adaptToDeviceRatio)
    const scene = new Scene(engine, sceneOptions)

    const promise = new Promise<[Engine, Scene]>(async (resolve) => {
        if (onSceneReady) {
            if (scene.isReady()) {
                await onSceneReady(scene)
                resolve([engine, scene])
            } else {
                scene.onReadyObservable.addOnce(async (scene) => {
                    await onSceneReady(scene)
                    resolve([engine, scene])
                })
            }
        }
    })

    engine.runRenderLoop(() => {
        engine.resize()
        scene.render() // scene always has camera in this case
    })

    return promise
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
    const [scene, setScene] = useState<Scene>()

    useEffect(() => {
        if (!loaded) {
            initScene(canvas.current, props).then(([, scene]) => {
                setScene(scene)
                setLoaded(true)
            })
        }

        return () => {
            if (scene !== null) {
                scene!.dispose()
            }
        }
    }, [])

    return <canvas ref={canvas} {...rest} />
}

export default SceneComponent
