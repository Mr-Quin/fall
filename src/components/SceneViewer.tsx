import React, { useCallback, useEffect, useRef } from 'react'
import styled from 'styled-components'
import * as BABYLON from '@babylonjs/core'
import '@babylonjs/core/Loading/loadingScreen'
import '@babylonjs/loaders/glTF'
import SceneComponent from './SceneComponent'
import Environment from '../models/Environment'

// star is loaded by file-loader as configured in config-overrides.js
import star from '../assets/star.gltf'

const BabylonScene = styled(SceneComponent)`
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
`

const SceneViewer = ({ ...props }) => {
    const environmentRef = useRef<any>()

    useEffect(() => {
        environmentRef.current.createCamera().createLight().createGround().createEffects()
        environmentRef.current.sceneColor = BABYLON.Color3.Black()
        environmentRef.current.enableDebugMetrics()
    }, [environmentRef])

    const onSceneReady = useCallback(async (scene) => {
        const canvas = scene.getEngine().getRenderingCanvas()
        environmentRef.current = new Environment(scene, canvas)
        scene.enablePhysics()
        console.log(star.substring(1))

        const importResult = await BABYLON.SceneLoader.ImportMeshAsync(
            '',
            '',
            star.substring(1), //remove the starting slash in file name
            scene,
            undefined,
            '.gltf'
        )

        const starMesh = importResult.meshes[0]
        // importResult.meshes[0].scaling.scaleInPlace(10)
        starMesh.physicsImpostor = new BABYLON.PhysicsImpostor(
            starMesh,
            BABYLON.PhysicsImpostor.SphereImpostor,
            { mass: 1, restitution: 0.9 },
            scene
        )

        // const sphere = BABYLON.Mesh.CreateSphere('sphere1', 16, 2, scene)
        // sphere.physicsImpostor = new BABYLON.PhysicsImpostor(
        //     sphere,
        //     BABYLON.PhysicsImpostor.SphereImpostor,
        //     { mass: 1, restitution: 0.9 },
        //     scene
        // )
    }, [])

    const onRender = useCallback((scene) => void 0, [])

    console.log('canvas render')

    return <BabylonScene antialias onSceneReady={onSceneReady} onRender={onRender} />
}

export default SceneViewer
