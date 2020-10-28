import React, { useCallback } from 'react'
import styled from 'styled-components'
import * as BABYLON from '@babylonjs/core'
import '@babylonjs/loaders/glTF'
import '@babylonjs/inspector'

import { start as toneStart } from 'tone'

import SceneComponent from './SceneComponent'

import useStore from '../../stores/store'
import useMoodStore from '../../stores/moodStore'
import useHelperStore from '../../stores/HelperStore'

// star is loaded by file-loader as configured in config-overrides.js
import { starGlb, star, starRound, flare } from '../../assets'
import { randomRange } from '../../utils/utils'

const BabylonScene = styled(SceneComponent)`
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
    outline: none;
`

const actions = useStore.getState().actions
const {
    optimizeScene,
    createChain,
    createGlow,
    createGround,
    createLight,
    createTransition,
    createBlinkAnimation,
    createCollisionParticleSystem,
    createAmbientParticleSystem,
    createStarField,
    setPhysicsImposter,
    enableDebugMetrics,
    toggleOverlay,
} = useHelperStore.getState()
let playTone = useMoodStore.getState().play

const onSceneReady = async (scene) => {
    scene.enablePhysics(new BABYLON.Vector3(0, -9.8, 0), new BABYLON.AmmoJSPlugin())

    const canvas = scene.getEngine().getRenderingCanvas()
    const camera = new BABYLON.ArcRotateCamera('Camera', 0, 0, 0, BABYLON.Vector3.Zero(), scene)
    actions.init(scene, canvas, camera)

    const domeLight = createLight()
    const ground = createGround()
    const glowLayer = createGlow()
    optimizeScene()
    scene.clearColor = BABYLON.Color3.Black()

    // debugging
    if (process.env.NODE_ENV === 'development') {
        enableDebugMetrics()
        toggleOverlay()
    }

    // camera
    camera.attachControl(canvas, true)
    camera.fov = 0.6
    camera.lowerRadiusLimit = 10
    camera.target = new BABYLON.Vector3(0, 35, 0)
    camera.setPosition(new BABYLON.Vector3(0, 35, 15))
    const lensParams = {
        edge_blur: 0.5,
        chromatic_aberration: 0.5,
        distortion: 0.3,
        grain_amount: 1,
        dof_focus_distance: 1,
        dof_aperture: 0.8,
        dof_pentagon: true,
    }
    const lensEffect = new BABYLON.LensRenderingPipeline('lensEffects', lensParams, scene, 1.0, [
        camera,
    ])

    // load star
    const {
        meshes: [starRoot, starMesh],
    } = await BABYLON.SceneLoader.ImportMeshAsync(
        '',
        '',
        starGlb.substring(1), //remove the starting slash in file name
        scene,
        null,
        '.glb'
    )

    // star physics
    starMesh.parent = null
    setPhysicsImposter(starMesh, BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 1,
        friction: 2,
        restitution: 0.5,
    })

    const hangingPoint = BABYLON.Mesh.CreateBox('joint-root', 1, scene).convertToUnIndexedMesh()
    hangingPoint.isVisible = false
    hangingPoint.position.set(0, 40, 0)
    setPhysicsImposter(hangingPoint, BABYLON.PhysicsImpostor.BoxImpostor, {
        mass: 0,
    })

    // make chains
    const chains = createChain(hangingPoint, starMesh, { distance: 0.6, count: 3, mass: 1 })

    // set star position so it swings
    starMesh.position.set(3, 36, 0)

    // setup camera goal. goal lerps to star to create smooth transitionTo
    const cameraGoal = new BABYLON.TransformNode('goal')
    cameraGoal.position = starMesh.position
    camera.lockedTarget = cameraGoal

    // light attached to star
    const starLight = new BABYLON.PointLight('star-light', starMesh.position, scene)
    starLight.intensity = 0.1
    starLight.diffuse = new BABYLON.Color3(1, 1, 0.8)
    starLight.specular = BABYLON.Color3.Black()
    starLight.shadowEnabled = false

    // particle field following star
    const ambientPsEmitter = BABYLON.Mesh.CreateBox(
        'particle-field',
        1,
        scene
    ).convertToUnIndexedMesh()
    ambientPsEmitter.isVisible = false

    //goal and light follow star
    scene.onBeforeRenderObservable.add(() => {
        cameraGoal.position = BABYLON.Vector3.Lerp(cameraGoal.position, starMesh.position, 0.1)
        starLight.position = starMesh.position
        ambientPsEmitter.position = cameraGoal.position
    })

    // particle systems
    const collisionPs = createCollisionParticleSystem(50, new BABYLON.Texture(star, scene))
    const starField1 = createStarField(80, new BABYLON.Texture(starRound, scene))
    const starField2 = createStarField(240, new BABYLON.Texture(flare, scene))
    const ambientPs = createAmbientParticleSystem(new BABYLON.Texture(flare, scene))
    collisionPs.emitter = starMesh
    ambientPs.emitter = ambientPsEmitter
    collisionPs.start()
    starField1.start()
    starField2.start()
    // ambientPs is started when star hits ground

    // animations
    const starLightAnimation = createBlinkAnimation(0.2)

    // actions
    starMesh.actionManager = new BABYLON.ActionManager(scene)
    starMesh.actionManager.registerAction(
        new BABYLON.ExecuteCodeAction(
            {
                trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
                parameter: {
                    mesh: ground,
                    usePreciseIntersection: true,
                },
            },
            () => {
                console.log('bounce')
                scene.beginDirectAnimation(starLight, [starLightAnimation], 0, 10)
                collisionPs.manualEmitCount = randomRange(3, 5, true)
                playTone()
            }
        )
    )

    // star falls
    const fall = async () => {
        const babylonAudioContext = BABYLON.Engine.audioEngine.audioContext!
        await babylonAudioContext.resume()
        await toneStart()
        chains.forEach((link) => link.dispose())
        collisionPs.manualEmitCount = randomRange(4, 8, true)
        ambientPs.start()

        const apertureObserver = scene.onBeforeRenderObservable.add(() => {
            const { dof_aperture } = lensParams
            lensParams.dof_aperture = BABYLON.Scalar.Lerp(dof_aperture, 0.08, 0.03)
            lensEffect.setAperture(dof_aperture)
            if (dof_aperture < 0.085) apertureObserver!.unregisterOnNextCall = true
        })

        let resolve // resolves when beta transition finishes
        const promise = new Promise((res) => (resolve = res))

        createTransition(camera, 'beta', Math.PI / 4, 20).then(() => {
            starField1.dispose()
            starField2.dispose()
            resolve(1)
            createTransition(camera, 'alpha', (3 / 4) * Math.PI, 55)
        })
        return promise
    }

    useStore.setState({ sceneReady: true })
    useStore.setState(({ actions }) => (actions.fall = fall) as any)
    console.log('Ready')
}

const SceneViewer = (props) => {
    const onRender = useCallback((scene) => void 0, [])

    return (
        <>
            <BabylonScene antialias onSceneReady={onSceneReady} onRender={onRender} />
        </>
    )
}

export default SceneViewer
