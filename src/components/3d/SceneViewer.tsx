import React, { useCallback } from 'react'
import styled from 'styled-components'

import {
    ActionManager,
    ArcRotateCamera,
    CannonJSPlugin,
    Color3,
    Color4,
    Engine,
    ExecuteCodeAction,
    FxaaPostProcess,
    LensRenderingPipeline,
    Mesh,
    PhysicsImpostor,
    PointLight,
    Scalar,
    Scene,
    SceneLoader,
    Texture,
    TransformNode,
    Vector3,
} from '@babylonjs/core'
import '@babylonjs/loaders/glTF'

import { start as toneStart } from 'tone'

import SceneComponent from './SceneComponent'

import useStore from '../../stores/store'
import useHelperStore from '../../stores/HelperStore'

// star is loaded by file-loader as configured in config-overrides.js
import { flare, star, starGlb, starRound } from '../../assets'
import { mapValue, randomRange } from '../../utils/utils'
import { sceneConfig, colors } from '../../config/scene-config'

const BabylonScene = styled(SceneComponent)`
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
    outline: none;
`

const { init, playTone } = useStore.getState().actions
const clearColor = useStore.getState().defaults.backgroundColor
const {
    createChain,
    createGlow,
    createLight,
    createTransition,
    createBlinkAnimation,
    createCollisionParticleSystem,
    createAmbientParticleSystem,
    createTrailParticleSystem,
    createStarField,
    setPhysicsImposter,
    enableDebugMetrics,
    toggleOverlay,
} = useHelperStore.getState()
const { HALF_PI, TITLE_CAMERA_ALPHA, TITLE_CAMERA_BETA } = sceneConfig

const onSceneReady = async (scene: Scene) => {
    scene.enablePhysics(new Vector3(0, -9.8, 0), new CannonJSPlugin(false))
    const canvas = scene.getEngine().getRenderingCanvas()
    const camera = new ArcRotateCamera('Camera', 0, 0, 0, Vector3.Zero(), scene)
    await init(scene, canvas, camera)

    scene!.autoClear = false // Color buffer
    scene!.autoClearDepthAndStencil = false // Depth and stencil, obviously
    scene.clearColor = Color4.FromHexString(clearColor)
    createLight()
    createGlow()

    // debugging
    if (process.env.NODE_ENV === 'development') {
        toggleOverlay()
        enableDebugMetrics()
    }

    // camera
    camera.fov = 0.6
    camera.lowerRadiusLimit = 10
    camera.target = new Vector3(0, 35, 0)
    camera.setPosition(new Vector3(0, 35, 15))
    const lensParams = {
        edge_blur: 0.5,
        chromatic_aberration: 0.5,
        distortion: 0.5,
        grain_amount: 0.2,
        dof_focus_distance: 1,
        dof_aperture: 0.8,
        dof_pentagon: true,
    }
    const lensEffect = new LensRenderingPipeline('lensEffects', lensParams, scene, 1.0, [camera])
    const fxaa = new FxaaPostProcess('fxaa', 1.0, camera)
    fxaa.autoClear = false

    // load star
    const {
        meshes: [starRoot, starMesh],
    } = await SceneLoader.ImportMeshAsync(
        '',
        '',
        starGlb.substring(1), //remove the starting slash in file name
        scene,
        null,
        '.glb'
    )
    starMesh.parent = null
    starMesh.material!.freeze()
    starRoot.dispose()

    // star physics
    setPhysicsImposter(starMesh, PhysicsImpostor.BoxImpostor, {
        mass: 1,
        friction: 2,
        restitution: 0.5,
    })

    const hangingPoint = Mesh.CreateBox('joint-root', 1, scene).convertToUnIndexedMesh()
    hangingPoint.isVisible = false
    hangingPoint.position.set(0, 40, 0)
    setPhysicsImposter(hangingPoint, PhysicsImpostor.BoxImpostor, {
        mass: 0,
    })

    // make chains
    const chains = createChain(hangingPoint, starMesh, {
        distance: 1,
        count: 1,
        mass: 1,
        hideChains: true,
    })

    // set star position so it swings
    starMesh.position.set(0, 35, 0)

    // setup camera goal. goal lerps to star to create smooth transitionTo
    const cameraGoal = new TransformNode('goal')
    cameraGoal.position = starMesh.position
    camera.lockedTarget = cameraGoal

    // light attached to star
    const starLight = new PointLight('star-light', starMesh.position, scene)
    starLight.intensity = 0.1
    starLight.diffuse = new Color3(1, 1, 0.8)
    starLight.specular = Color3.Black()
    starLight.shadowEnabled = false

    // collider
    const collider = Mesh.CreateBox('collider', 1, scene).convertToUnIndexedMesh()
    setPhysicsImposter(collider, PhysicsImpostor.BoxImpostor, {
        mass: 0,
        restitution: 1,
        friction: 0.5,
    })
    let colliderYTarget = 0
    collider.position.set(0, 0, 0)
    collider.isVisible = false

    // particle field following star
    const ambientPsEmitter = Mesh.CreateBox('particle-field', 1, scene).convertToUnIndexedMesh()
    ambientPsEmitter.parent = cameraGoal
    ambientPsEmitter.isVisible = false

    //goal and light follow star
    const mainSceneObserver = scene.onBeforeRenderObservable.add(() => {
        cameraGoal.position = Vector3.Lerp(cameraGoal.position, starMesh.position, 0.1)
        starLight.position = starMesh.position
        collider.position.set(starMesh.position.x, colliderYTarget, starMesh.position.z)
        scene.clearColor = Color4.Lerp(
            scene.clearColor,
            useStore.getState().mutations.colorTarget,
            0.003
        )
    })

    const titleCameraObserver = scene.onBeforeRenderObservable.add(() => {
        const normalizedPointerX = scene.pointerX / window.innerWidth
        const normalizedPointerY = scene.pointerY / window.innerHeight
        const alphaTarget =
            HALF_PI + mapValue(normalizedPointerX, 0, 1, -TITLE_CAMERA_ALPHA, TITLE_CAMERA_ALPHA)
        const betaTarget =
            HALF_PI + mapValue(normalizedPointerY, 0, 1, -TITLE_CAMERA_BETA, TITLE_CAMERA_BETA)
        camera.alpha = Scalar.Lerp(camera.alpha, alphaTarget, 0.01)
        camera.beta = Scalar.Lerp(camera.beta, betaTarget, 0.01)
    })

    // particle systems
    const starTex = new Texture(star, scene)
    const roundStarTex = new Texture(starRound, scene)
    const flareTex = new Texture(flare, scene)
    const collisionPs = createCollisionParticleSystem(50, starTex)
    const starField1 = createStarField(300, roundStarTex)
    const starField2 = createStarField(
        300,
        roundStarTex,
        new Color4(0.5, 0.6, 0.8, 1),
        new Color4(1, 0.3, 0.6, 1)
    )
    const starField3 = createStarField(600, flareTex)
    const starField4 = createStarField(
        600,
        flareTex,
        new Color4(0.1, 0.5, 1, 1),
        new Color4(0.3, 0.4, 0.8, 1)
    )
    const ambientPs = createAmbientParticleSystem(flareTex)
    collisionPs.emitter = starMesh
    starField1.emitter = starMesh
    starField2.emitter = starMesh
    starField3.emitter = starMesh
    starField4.emitter = starMesh
    ambientPs.emitter = ambientPsEmitter
    collisionPs.start()
    starField1.start()
    starField2.start()
    // ambientPs is started when star hits ground

    // animations
    const starLightAnimation = createBlinkAnimation(0.2)

    const step = Mesh.CreateBox('step-box', 3, scene).convertToUnIndexedMesh()
    step.scaling.set(1, 1 / 5, 1)
    step.isVisible = false

    const createStep = () => {
        const bounces = useStore.getState().mutations.bounces
        return step.createInstance(`step-box-clone-${bounces.toString()}`)
    }

    // actions
    const onCollision = () => {
        console.log('bounce')
        scene.beginDirectAnimation(starLight, [starLightAnimation], 0, 10)
        collisionPs.manualEmitCount = randomRange(3, 5, true)
        playTone()
        colliderYTarget -= randomRange(8, 16, true)

        const step = createStep()
        step.position.set(starMesh.position.x, starMesh.position.y - 3 / 5, starMesh.position.z)
        useStore.setState(({ mutations }) => void (mutations.bounces += 1) as any)
    }
    starMesh.actionManager = new ActionManager(scene)
    starMesh.actionManager.registerAction(
        new ExecuteCodeAction(
            {
                trigger: ActionManager.OnIntersectionEnterTrigger,
                parameter: {
                    mesh: collider,
                    usePreciseIntersection: true,
                },
            },
            onCollision
        )
    )

    // star falls
    const fall = async () => {
        const babylonAudioContext = Engine.audioEngine.audioContext!
        await babylonAudioContext.resume()
        await toneStart()
        chains.forEach((link) => link.dispose())
        collisionPs.manualEmitCount = randomRange(4, 8, true)
        ambientPs.start()
        // attach camera control only after the fall button is clicked
        camera.attachControl(canvas as HTMLCanvasElement, true)

        scene.onBeforeRenderObservable.remove(titleCameraObserver)
        const apertureObserver = scene.onBeforeRenderObservable.add(() => {
            const { dof_aperture } = lensParams
            lensParams.dof_aperture = Scalar.Lerp(dof_aperture, 0.08, 0.03)
            lensEffect.setAperture(dof_aperture)
            if (dof_aperture < 0.085) apertureObserver!.unregisterOnNextCall = true
        })

        let resolve // resolves when beta transition finishes
        const promise = new Promise((res) => (resolve = res))

        createTransition(camera, 'beta', Math.PI / 4, 20).then(() => {
            resolve(1)
            createTransition(camera, 'alpha', (3 / 4) * Math.PI, 55).then(
                () => void scene.onBeforeRenderObservable.add(() => void (camera.alpha += 0.002))
            )
        })
        return promise
    }

    useStore.setState({ sceneReady: true })
    useStore.setState(({ actions }) => void (actions.fall = fall) as any)
    console.info('Scene is ready')
}

const SceneViewer = (props) => {
    // const onRender = useCallback((scene) => void 0, [])

    return (
        <>
            <BabylonScene
                antialias
                onSceneReady={onSceneReady}
                // onRender={onRender}
                // engineOptions={{
                //     deterministicLockstep: true,
                //     lockstepMaxSteps: 4,
                // }}
            />
        </>
    )
}

export default SceneViewer
