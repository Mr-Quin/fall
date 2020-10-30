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

    const canvas = useRef<any>()

    const [loaded, setLoaded] = useState<boolean>(false)
    const [scene, setScene] = useState<Scene>()

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
            const engine = new Engine(canvas.current, antialias, engineOptions, adaptToDeviceRatio)
            const scene = new Scene(engine, sceneOptions)
            setScene(scene)
            if (onSceneReady) {
                if (scene.isReady()) {
                    onSceneReady(scene)
                } else {
                    scene.onReadyObservable.addOnce((scene) => onSceneReady(scene))
                }
            }
            if (onRender) {
                engine.runRenderLoop(() => {
                    onRender(scene)
                    scene.render()
                })
            } else {
                engine.runRenderLoop(() => {
                    scene.render()
                })
            }
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
