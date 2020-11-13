import React from 'react'
import styled from 'styled-components'

import useStore from '../../stores/store'

import '@babylonjs/loaders/glTF'
import {
    ActionManager,
    ArcRotateCamera,
    Color3,
    Color4,
    Engine,
    ExecuteCodeAction,
    FxaaPostProcess,
    GlowLayer,
    LensRenderingPipeline,
    Mesh,
    NoiseProceduralTexture,
    OimoJSPlugin,
    PhysicsImpostor,
    PointLight,
    Scalar,
    Scene,
    SceneLoader,
    SceneOptimizer,
    SceneOptimizerOptions,
    StandardMaterial,
    Texture,
    TransformNode,
    Vector3,
} from '@babylonjs/core'

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
import { easeInOutCubic, mapValue, randomRange } from '../../utils/utils'
import { constants, colors, cameraLensParameters } from '../../config/scene-config'

const BabylonScene = styled(SceneComponent)`
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
    outline: none;
`

const { db } = useStore.getState()
const { initScene, playTone, appendDb } = useStore.getState().actions

const {
    CAMERA_FOLLOW_SPEED,
    CAMERA_FOV,
    CAMERA_LOWER_RADIUS,
    CAMERA_UPPER_RADIUS,
    END_ANIMATION_DELAY,
    END_CAMERA_ANIMATION_DURATION,
    END_CAMERA_Y_OFFSET,
    END_FIRST_STEP_OFFSET,
    END_FLOOR_Y_OFFSET,
    END_FOG_ANIMATION_SPEED,
    END_STAR_VELOCITY_THRESHOLD,
    FOG_DENSITY,
    FXAA_STRENGTH,
    LIGHT_BASE_INTENSITY,
    LIGHT_BLINK_INTENSITY,
    STARLIGHT_DISTANCE,
    TITLE_CAMERA_ALPHA,
    TITLE_CAMERA_BETA,
    TITLE_CAMERA_SPEED,
} = constants
const HALF_PI = Math.PI / 2

const onSceneReady = async (scene: Scene) => {
    /**
     * Scene setup
     */
    const canvas = scene.getEngine().getRenderingCanvas()
    const camera = new ArcRotateCamera('Camera', 0, 0, 0, Vector3.Zero(), scene)
    new GlowLayer('glow', scene, { mainTextureSamples: 2 })
    createLight(scene)
    await initScene(scene, canvas, camera)

    // scene.enablePhysics(
    //     new Vector3(0, -9.8, 0),
    //     new CannonJSPlugin(false, 10, await import('cannon'))
    // )
    scene.enablePhysics(new Vector3(0, -9.8, 0), new OimoJSPlugin(false, 15, await import('oimo')))
    scene.getPhysicsEngine()!.setTimeStep(1 / 60)

    scene.clearColor = Color4.FromHexString(colors.BACKGROUND_COLOR)
    scene.fogEnabled = true
    scene.fogMode = Scene.FOGMODE_EXP2
    scene.fogColor = Color3.FromHexString(colors.BACKGROUND_COLOR.slice(0, -2))
    scene.fogDensity = FOG_DENSITY

    /**
     * Optimization
     */
    scene.autoClear = false // Color buffer
    scene.autoClearDepthAndStencil = false // Depth and stencil
    const optimizer = SceneOptimizer.OptimizeAsync(
        scene,
        SceneOptimizerOptions.HighDegradationAllowed(),
        () => {
            console.info('Optimization success')
        },
        () => {
            console.info('Optimization failed')
        }
    )
    optimizer.optimizations[7].priority = 1 // pixel scaling
    optimizer.optimizations[4].priority = 4 // particle system
    console.debug('Optimizer options:')
    console.debug(optimizer.optimizations)
    console.info('Optimizing scene...')

    /**
     * Load last position and steps from indexeddb
     */
    const steps = (await db.steps?.toArray()) || []
    const initPosition = steps.length ? steps[steps.length - 1].position : new Vector3(0, 40, 0)

    /**
     * Camera setup
     */
    camera.fov = CAMERA_FOV
    camera.lowerRadiusLimit = CAMERA_LOWER_RADIUS
    camera.upperRadiusLimit = CAMERA_UPPER_RADIUS
    camera.target = new Vector3(0, 0, 0).addInPlace(initPosition)
    camera.setPosition(new Vector3(0, 0, 15).addInPlace(initPosition))

    /**
     * Postprocessing effects
     */
    const lensEffect = new LensRenderingPipeline('lensEffects', cameraLensParameters, scene, 1.0, [
        camera,
    ])
    const fxaa = new FxaaPostProcess('fxaa', FXAA_STRENGTH, camera)
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
    starRoot.dispose()
    // @ts-ignore
    starMesh.material!.emissiveColor = Color3.FromHexString(colors.STAR_COLOR_PRIMARY.slice(0, -2))
    starMesh.material!.freeze()

    /**
     * Point light attached to star
     */
    const starLight = new PointLight('star-light', starMesh.position, scene)
    starLight.intensity = 0.2
    starLight.diffuse = Color3.FromHexString(colors.STAR_LIGHT_COLOR.slice(0, -2))
    starLight.specular = Color3.Black()
    starLight.shadowEnabled = false
    starLight.range = STARLIGHT_DISTANCE
    // animation to brighten light
    const starLightAnimation = createBlinkAnimation(LIGHT_BASE_INTENSITY, LIGHT_BLINK_INTENSITY)

    /**
     * Physics settings
     */
    // star physics
    setPhysicsImposter(starMesh, PhysicsImpostor.BoxImpostor, scene, {
        mass: 1,
        friction: 2,
        restitution: 0.5,
    })
    // chain anchor
    const hangingPoint = Mesh.CreateBox('joint-root', 1, scene).convertToUnIndexedMesh()
    hangingPoint.isVisible = false
    hangingPoint.position.copyFrom(initPosition)
    setPhysicsImposter(hangingPoint, PhysicsImpostor.BoxImpostor, scene, {
        mass: 0,
    })
    // make chain
    const chains = createChain(hangingPoint, starMesh, scene, {
        distance: 2,
        count: 1,
        mass: 1,
        hideChains: true,
    })
    // set star position after physics so it swings
    starMesh.position.copyFrom(initPosition).addInPlace(new Vector3(2, -4, 0))

    /**
     * Step collider
     */
    const collider = Mesh.CreateBox('collider', 1, scene).convertToUnIndexedMesh()
    setPhysicsImposter(collider, PhysicsImpostor.BoxImpostor, scene, {
        mass: 0,
        restitution: 0.5,
        friction: 0.5,
    })
    let colliderYTarget = initPosition._y - 35
    collider.isVisible = false

    /**
     * Camera goal
     */
    const cameraGoal = new TransformNode('goal')
    cameraGoal.position = starMesh.position
    camera.lockedTarget = cameraGoal

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
     * Make camera, light, skybox, and collider follow star, and change background color
     */
    const mainSceneObserver = scene.onAfterPhysicsObservable.add(() => {
        starLight.position.copyFrom(starMesh.position)
        cameraGoal.position = Vector3.Lerp(
            cameraGoal.position,
            starMesh.position,
            CAMERA_FOLLOW_SPEED
        )
        collider.position.set(starMesh.position.x, colliderYTarget, starMesh.position.z) // collider is always directly below star
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
            emitterSize: 20,
            capacity: 300,
            texture: roundStarTex,
            noiseTexture: noiseTex,
            color1: Color4.FromHexString(colors.PARTICLE_COLOR_2),
            color2: Color4.FromHexString(colors.PARTICLE_COLOR_5),
        },
        scene
    )
    const starField2 = createStarFieldParticleSystem(
        {
            capacity: 300,
            texture: roundStarTex,
            noiseTexture: noiseTex,
            color1: Color4.FromHexString(colors.PARTICLE_COLOR_4),
            color2: Color4.FromHexString(colors.PARTICLE_COLOR_6),
        },
        scene
    )
    const starField3 = createStarFieldParticleSystem(
        {
            capacity: 50,
            texture: flareTex,
            noiseTexture: noiseTex,
            color1: Color4.FromHexString(colors.PARTICLE_COLOR_2),
            color2: Color4.FromHexString(colors.PARTICLE_COLOR_5),
            maxSize: 0.2,
        },
        scene
    )
    const ambientField = createAmbientParticleSystem(
        {
            capacity: 50,
            texture: flareTex,
            noiseTexture: noiseTex2,
            color1: Color4.FromHexString(colors.PARTICLE_COLOR_2),
            color2: Color4.FromHexString(colors.PARTICLE_COLOR_1),
        },
        scene
    )

    collisionPs.emitter = starMesh
    starField1.emitter = starMesh
    starField2.emitter = starMesh
    starField3.emitter = starMesh
    ambientField.emitter = starMesh
    collisionPs.start()
    starField1.start()
    starField2.start()
    starField3.start()
    ambientField.start()

    /**
     * Function to create a box at each collision location
     */
    const step = Mesh.CreateBox('step-box', 3, scene).convertToUnIndexedMesh()

    const stepMaterial = new StandardMaterial('step-material', scene)
    stepMaterial.emissiveColor = Color3.Black()
    stepMaterial.diffuseColor = Color3.Gray()

    step.scaling.set(1, 1 / 5, 1)
    step.isVisible = false
    step.material = stepMaterial

    const createStep = (position: Vector3) => {
        const clonedStep = step.createInstance(
            `step-box-clone-${(Math.random() * 1e17).toString(36)}`
        )
        clonedStep.position.copyFrom(position).subtractInPlace(new Vector3(0, 3 / 5, 0))
        return clonedStep
    }

    /**
     * Create steps from positions in indexeddb
     */
    for (const step of steps) {
        const s = createStep(step.position)
        s.hasVertexAlpha = true
    }

    /**
     * On collision action
     */
    const onCollision = () => {
        // brightens the light briefly
        scene.beginDirectAnimation(starLight, [starLightAnimation], 0, 10)
        // emit collision particles
        collisionPs.manualEmitCount = randomRange(3, 5, true)

        // play a sound
        const notes = playTone()
        const data = {
            position: starMesh.position,
            notes: notes,
            time: new Date().getTime(),
        }
        // push to steps array
        steps.push(data)
        // add position to db
        appendDb(data)
        // set the collider to a lower y position
        colliderYTarget -= randomRange(8, 16, true)
        // make a box at collision location
        createStep(starMesh.position)

        useStore.setState(({ mutations }) => void (mutations.bounces += 1) as any)
    }
    // register the onCollision action
    starMesh.actionManager = new ActionManager(scene)
    const colliderAction = starMesh.actionManager.registerAction(
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
        // remove the camera animation on title screen
        scene.onBeforeRenderObservable.remove(titleCameraObserver)
        // tone down depth of field
        const apertureObserver = scene.onBeforeRenderObservable.add(() => {
            const { dof_aperture } = cameraLensParameters
            cameraLensParameters.dof_aperture = Scalar.Lerp(dof_aperture, 0.08, 0.03)
            lensEffect.setAperture(dof_aperture)
            if (dof_aperture < 0.055) apertureObserver!.unregisterOnNextCall = true
        })
        // animate camera
        await createTransition(camera, 'beta', Math.PI / 4, 20)
        // rotate camera each frame, unregister when takeBreak is triggered
        const rotateCameraAnimation = scene.onBeforeRenderObservable.add(() => {
            camera.alpha += 0.002
            if (useStore.getState().mutations.end) {
                rotateCameraAnimation!.unregisterOnNextCall = true
            }
        })
        console.debug('Fall ended')
    }

    /**
     * End journey trigger
     */
    const endJourney = async () => {
        useStore.setState(({ mutations }) => void (mutations.end = true) as any)
        // create a floor
        const floorSize = 10000
        const floor = Mesh.CreateBox('end-floor', floorSize, scene).convertToUnIndexedMesh()
        floor.position
            .copyFrom(starMesh.position)
            .addInPlaceFromFloats(0, -floorSize / 2 - END_FLOOR_Y_OFFSET, 0)
        setPhysicsImposter(floor, PhysicsImpostor.BoxImpostor, scene, {
            mass: 0,
        })
        // unregister and dispose collider
        starMesh.actionManager!.unregisterAction(colliderAction!)
        collider.dispose()
        // register floor
        const floorColliderAction = starMesh.actionManager!.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: {
                        mesh: floor,
                        usePreciseIntersection: true,
                    },
                },
                () => {
                    // a few lines from onCollision()
                    scene.beginDirectAnimation(starLight, [starLightAnimation], 0, 10)
                    collisionPs.manualEmitCount = randomRange(3, 5, true)
                    playTone()
                }
            )
        )
        // remove camera zoom limit
        camera.upperRadiusLimit = null
        // wait for star to stop moving, then do some more things
        const waitForStarToStopObserver = scene.onBeforeRenderObservable.add(() => {
            // console.debug(`Star speed: ${starMesh.physicsImpostor!.getLinearVelocity()!.length()}`)
            if (
                starMesh.physicsImpostor!.getLinearVelocity()!.length() <
                END_STAR_VELOCITY_THRESHOLD
            ) {
                // unregister the wait observer
                waitForStarToStopObserver!.unregisterOnNextCall = true
                // unregister floor collider action, so no more sound and particles will be emitted
                starMesh.actionManager!.unregisterAction(floorColliderAction!)
                // get firstStep position with slight offset
                const firstStepPos = END_FIRST_STEP_OFFSET.addInPlace(steps[0].position)
                // add an endAnimationObserver a few seconds after the star stops
                setTimeout(() => {
                    /**
                     *  This finds a lerp amount that will result in a point that is Y_OFFSET above the firstStep position
                     *  This value is then used to calculate endPosition below
                     */
                    const t = Math.abs(
                        (END_CAMERA_Y_OFFSET - starMesh.position.subtract(firstStepPos).y) /
                            starMesh.position.y
                    )
                    const initPos = { ...camera.position } as Vector3
                    const endPosition = Vector3.Lerp(starMesh.position, firstStepPos, t)

                    // get some times to use in lerp animation
                    const startTime = new Date().getTime()
                    const duration = END_CAMERA_ANIMATION_DURATION * 1000

                    const targetColor = Color3.FromHexString(colors.STAR_COLOR_PRIMARY.slice(0, -2))
                    // the animation part
                    const endAnimationObserver = scene.onBeforeRenderObservable.add(() => {
                        const elapsedTime = new Date().getTime() - startTime
                        // console.debug(
                        //     `Elapsed time: ${(elapsedTime / 1000).toFixed(2)}, Emissive Color: ${
                        //         stepMaterial.emissiveColor
                        //     }, Fog Density: ${scene.fogDensity.toFixed(2)}`
                        // )
                        // make steps glow
                        stepMaterial.emissiveColor = Color3.Lerp(
                            stepMaterial.emissiveColor,
                            targetColor,
                            END_FOG_ANIMATION_SPEED / 2
                        )
                        // remove fog
                        scene.fogDensity = Scalar.Lerp(
                            scene.fogDensity,
                            0.0005,
                            END_FOG_ANIMATION_SPEED
                        )
                        // animate camera towards the endPosition calculated above
                        if (elapsedTime < duration) {
                            const newPos = Vector3.Lerp(
                                initPos,
                                endPosition,
                                easeInOutCubic(elapsedTime / duration)
                            )
                            camera.setPosition(newPos)
                        } else {
                            // unregister after duration
                            endAnimationObserver!.unregisterOnNextCall = true
                            mainSceneObserver!.unregisterOnNextCall = true
                        }
                    })
                }, END_ANIMATION_DELAY * 1000)
            }
        })
    }

    /**
     * Dev overlays
     */
    if (process.env.NODE_ENV === 'development') {
        await toggleOverlay(scene)
        await enableDebugMetrics(scene)
    }

    /**
     * Wait for optimizer to finish
     */
    // await optimizerPromise
    /**
     * Add functions to store, resolve this promise
     */
    useStore.setState({ sceneReady: true })
    useStore.setState(({ actions }) => void (actions.fall = fall) as any)
    useStore.setState(({ actions }) => void (actions.takeBreak = endJourney) as any)
    console.debug('Scene is ready')
    optimizer.start()
    return scene
}

const SceneViewer = (props) => {
    // const onRender = useCallback((scene) => {}, [])
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
