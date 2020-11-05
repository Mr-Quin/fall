import React from 'react'
import styled from 'styled-components'

import useStore from '../../stores/store'

import {
    ActionManager,
    ArcRotateCamera,
    CannonJSPlugin,
    Color3,
    Color4,
    Engine,
    ExecuteCodeAction,
    FxaaPostProcess,
    GlowLayer,
    LensRenderingPipeline,
    Mesh,
    NoiseProceduralTexture,
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
import * as CANNON from 'cannon'

import SceneComponent from './SceneComponent'

import { flare, star, starGlb, starRound } from '../../assets'
import {
    createCollisionParticleSystem,
    createStarFieldParticleSystem,
    createAmbientParticleSystem,
} from '../../helpers/particleHelper'
import {
    createChain,
    createTransition,
    createLight,
    enableDebugMetrics,
    setPhysicsImposter,
    toggleOverlay,
} from '../../helpers/sceneHelpers'
import { createBlinkAnimation } from '../../helpers/animationHelpers'
import { mapValue, randomRange } from '../../utils/utils'
import { constants, colors } from '../../config/scene-config'

const BabylonScene = styled(SceneComponent)`
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
    outline: none;
`

const { initScene, playTone } = useStore.getState().actions

const { TITLE_CAMERA_ALPHA, TITLE_CAMERA_BETA, TITLE_CAMERA_SPEED } = constants
const HALF_PI = Math.PI / 2

const onSceneReady = async (scene: Scene) => {
    /**
     * Scene setup
     */
    scene.enablePhysics(new Vector3(0, -9.8, 0), new CannonJSPlugin(false, 10, CANNON))
    const canvas = scene.getEngine().getRenderingCanvas()
    const camera = new ArcRotateCamera('Camera', 0, 0, 0, Vector3.Zero(), scene)
    scene.autoClear = false // Color buffer
    scene.autoClearDepthAndStencil = false // Depth and stencil, obviously
    scene.clearColor = Color4.FromHexString(colors.backgroundColor)
    createLight(scene)
    const glowLayer = new GlowLayer('glow', scene, { mainTextureSamples: 2 })
    initScene(scene, canvas, camera)

    /**
     * Debug controls
     */
    if (process.env.NODE_ENV === 'development') {
        await toggleOverlay(scene)
        await enableDebugMetrics(scene)
    }

    /**
     * Camera setup
     */
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

    /**
     * Postprocessing effects
     */
    const lensEffect = new LensRenderingPipeline('lensEffects', lensParams, scene, 1.0, [camera])
    const fxaa = new FxaaPostProcess('fxaa', 1.0, camera)
    fxaa.autoClear = false

    /**
     * Load star model
     */
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

    /**
     * Point light attached to star
     */
    const starLight = new PointLight('star-light', starMesh.position, scene)
    starLight.intensity = 0.1
    starLight.diffuse = new Color3(1, 1, 0.8)
    starLight.specular = Color3.Black()
    starLight.shadowEnabled = false
    // animation to brighten light
    const starLightAnimation = createBlinkAnimation(0.2)

    /**
     * Physics settings
     */
    setPhysicsImposter(starMesh, PhysicsImpostor.BoxImpostor, scene, {
        mass: 1,
        friction: 2,
        restitution: 0.5,
    })

    const hangingPoint = Mesh.CreateBox('joint-root', 1, scene).convertToUnIndexedMesh()
    hangingPoint.isVisible = false
    hangingPoint.position.set(0, 40, 0)
    setPhysicsImposter(hangingPoint, PhysicsImpostor.BoxImpostor, scene, {
        mass: 0,
    })

    const chains = createChain(hangingPoint, starMesh, scene, {
        distance: 1,
        count: 1,
        mass: 1,
        hideChains: true,
    })

    /**
     * Set star position for swing
     * TODO: Pull this from a constant or local storage
     */
    starMesh.position.set(0, 35, 0)

    /**
     * Camera goal
     */
    const cameraGoal = new TransformNode('goal')
    cameraGoal.position = starMesh.position
    camera.lockedTarget = cameraGoal

    /**
     * Step collider
     */
    const collider = Mesh.CreateBox('collider', 1, scene).convertToUnIndexedMesh()
    setPhysicsImposter(collider, PhysicsImpostor.BoxImpostor, scene, {
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

    /**
     * Make camera, light, and collider follow star, and change background color
     */
    const mainSceneObserver = scene.onBeforeRenderObservable.add(() => {
        cameraGoal.position = Vector3.Lerp(cameraGoal.position, starMesh.position, 0.1)
        starLight.position = starMesh.position // copying position works better than parenting
        collider.position.set(starMesh.position.x, colliderYTarget, starMesh.position.z) // collider is always directly below star
        scene.clearColor = Color4.Lerp(
            scene.clearColor,
            useStore.getState().mutations.colorTarget,
            0.005
        )
    })

    /**
     * Particles
     */
    // textures
    const starTex = new Texture(star, scene)
    const roundStarTex = new Texture(starRound, scene)
    const flareTex = new Texture(flare, scene)
    // noise
    const noiseTex = new NoiseProceduralTexture('perlin', 256, scene)
    noiseTex.animationSpeedFactor = 1
    noiseTex.brightness = 0.5
    noiseTex.octaves = 2
    const noiseTex2 = new NoiseProceduralTexture('perlin', 256, scene)
    noiseTex2.animationSpeedFactor = 2
    noiseTex2.brightness = 0.5
    noiseTex2.octaves = 5
    // particle systems
    const collisionPs = createCollisionParticleSystem(starTex, 50, scene)
    const starField1 = createStarFieldParticleSystem(
        {
            capacity: 300,
            texture: roundStarTex,
            noiseTexture: noiseTex,
            color1: Color4.FromHexString(colors.particleColor2),
            color2: Color4.FromHexString(colors.particleColor5),
        },
        scene
    )
    const starField2 = createStarFieldParticleSystem(
        {
            capacity: 300,
            texture: roundStarTex,
            noiseTexture: noiseTex,
            color1: Color4.FromHexString(colors.particleColor4),
            color2: Color4.FromHexString(colors.particleColor6),
        },
        scene
    )
    const starField3 = createStarFieldParticleSystem(
        {
            capacity: 50,
            texture: flareTex,
            noiseTexture: noiseTex,
            color1: Color4.FromHexString(colors.particleColor2),
            color2: Color4.FromHexString(colors.particleColor5),
            maxSize: 0.2,
        },
        scene
    )
    const ambientField = createAmbientParticleSystem(
        {
            capacity: 50,
            texture: flareTex,
            noiseTexture: noiseTex2,
            color1: Color4.FromHexString(colors.particleColor2),
            color2: Color4.FromHexString(colors.particleColor1),
        },
        scene
    )
    collisionPs.emitter = starMesh
    starField1.emitter = starMesh
    starField2.emitter = starMesh
    starField3.emitter = starMesh
    ambientField.emitter = ambientPsEmitter
    collisionPs.start()
    starField1.start()
    starField2.start()
    starField3.start()
    ambientField.start()

    /**
     * Function to create a box at each collision location
     */
    const step = Mesh.CreateBox('step-box', 3, scene).convertToUnIndexedMesh()
    step.scaling.set(1, 1 / 5, 1)
    step.isVisible = false

    const createStep = () => {
        const bounces = useStore.getState().mutations.bounces
        return step.createInstance(`step-box-clone-${bounces.toString()}`)
    }

    /**
     * On collision action
     */
    const onCollision = () => {
        console.log('bounce')
        // brightens the light briefly
        scene.beginDirectAnimation(starLight, [starLightAnimation], 0, 10)
        // emit collision particles
        collisionPs.manualEmitCount = randomRange(3, 5, true)
        // play a sound
        playTone()
        // set the collider to a lower y position
        colliderYTarget -= randomRange(8, 16, true)
        // make a box at collision location
        const step = createStep()
        step.position.set(starMesh.position.x, starMesh.position.y - 3 / 5, starMesh.position.z)
        useStore.setState(({ mutations }) => void (mutations.bounces += 1) as any)
    }
    // register the onCollision action
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

    /**
     * Make camera follow mouse on title screen, unregistered when star falls
     * This is a 2 step lerp. The alpha and beta goal lerps to a normalized mouse position,
     * camera orientation then lerps to the goals.
     */
    let alphaGoal = HALF_PI
    let betaGoal = HALF_PI
    const titleCameraObserver = scene.onBeforeRenderObservable.add(() => {
        // normalize pointer location
        const normalizedPointerX = scene.pointerX / window.innerWidth
        const normalizedPointerY = scene.pointerY / window.innerHeight
        // map pointer location to camera location
        const alphaTarget =
            HALF_PI + mapValue(normalizedPointerX, 0, 1, -TITLE_CAMERA_ALPHA, TITLE_CAMERA_ALPHA)
        const betaTarget =
            HALF_PI + mapValue(normalizedPointerY, 0, 1, -TITLE_CAMERA_BETA, TITLE_CAMERA_BETA)
        // interpolate goal to camera target
        alphaGoal = Scalar.Lerp(alphaGoal, alphaTarget, TITLE_CAMERA_SPEED)
        betaGoal = Scalar.Lerp(betaGoal, betaTarget, TITLE_CAMERA_SPEED)
        // interpolate camera to goal
        camera.alpha = Scalar.Lerp(camera.alpha, alphaGoal, TITLE_CAMERA_SPEED)
        camera.beta = Scalar.Lerp(camera.beta, betaGoal, TITLE_CAMERA_SPEED)
    })

    /**
     * Star fall trigger
     */
    const fall = async () => {
        // resume audio context
        const babylonAudioContext = Engine.audioEngine.audioContext!
        await babylonAudioContext.resume()
        // remove chain to make star fall
        chains.forEach((link) => link.dispose())
        collisionPs.manualEmitCount = randomRange(4, 8, true)
        // attach camera controls
        camera.attachControl(canvas as HTMLCanvasElement, true)
        // remove the camera controller on title screen
        scene.onBeforeRenderObservable.remove(titleCameraObserver)
        // tone down depth of field
        const apertureObserver = scene.onBeforeRenderObservable.add(() => {
            const { dof_aperture } = lensParams
            lensParams.dof_aperture = Scalar.Lerp(dof_aperture, 0.08, 0.03)
            lensEffect.setAperture(dof_aperture)
            if (dof_aperture < 0.085) apertureObserver!.unregisterOnNextCall = true
        })
        // animate camera
        await createTransition(camera, 'beta', Math.PI / 4, 20)
        await createTransition(camera, 'alpha', (3 / 4) * Math.PI, 55)
        // rotate camera each frame
        scene.onBeforeRenderObservable.add(() => void (camera.alpha += 0.002))
    }

    /**
     * Add functions to store, resolve this promise
     */
    useStore.setState({ sceneReady: true })
    useStore.setState(({ actions }) => void (actions.fall = fall) as any)
    console.info('Scene is ready')
    return scene
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
            {props.children}
        </>
    )
}

export default SceneViewer
