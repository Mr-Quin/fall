import React, { useCallback, useRef } from 'react'
import styled from 'styled-components'
import * as BABYLON from '@babylonjs/core'
import '@babylonjs/loaders/glTF'
import throttle from 'lodash/throttle'

import SceneComponent from './SceneComponent'
import Environment from '../models/Environment'

import useStore from '../stores/store'
import useHelperStore from '../stores/HelperStore'

// star is loaded by file-loader as configured in config-overrides.js
import { starGlb, star, starRound, flare, ding as dingWav } from '../assets'
import { randomRange } from '../utils/utils'

const BabylonScene = styled(SceneComponent)`
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
    outline: none;
`

const createTransition = (object, prop, to, speed) => {
    const ease = new BABYLON.CubicEase()
    ease.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT)

    return new Promise((res, rej) => {
        BABYLON.Animation.CreateAndStartAnimation(
            'transition-animation',
            object,
            prop,
            speed,
            120,
            object[prop],
            to,
            0,
            ease,
            res
        )
    })
}

const { init } = useStore.getState().actions
const {
    createChain,
    createBlinkAnimation,
    createBlinkParticleSystem,
    createStarField,
    setPhysicsImposter,
    enableDebugMetrics,
    toggleOverlay,
} = useHelperStore.getState()

const SceneViewer = ({ ...props }) => {
    const environmentRef = useRef<Environment>()

    const onSceneReady = useCallback(async (scene) => {
        const canvas = scene.getEngine().getRenderingCanvas()
        const camera = new BABYLON.ArcRotateCamera('Camera', 0, 0, 0, BABYLON.Vector3.Zero(), scene)
        init(scene, canvas, camera)
        scene.getEngine().displayLoadingUI()

        environmentRef.current = new Environment(scene, canvas)

        const environment = environmentRef.current
        environment.createLight().createGround().createEffects()
        scene.clearColor = BABYLON.Color3.Black()

        enableDebugMetrics()
        toggleOverlay()

        // camera
        camera.attachControl(canvas, true)
        camera.fov = 0.6
        camera.lowerRadiusLimit = 10
        camera.target = new BABYLON.Vector3(0, 35, 0)
        camera.setPosition(new BABYLON.Vector3(0, 35, 15))

        // sound
        const ding = new BABYLON.Sound('ding', dingWav, scene, null, {
            loop: false,
            autoplay: false,
        })

        // load star
        const {
            meshes: [starRoot, starMesh],
        } = await BABYLON.SceneLoader.ImportMeshAsync(
            '',
            '',
            starGlb.substring(1), //remove the starting slash in file name
            scene,
            undefined,
            '.glb'
        )

        // star physics
        starMesh.parent = null
        setPhysicsImposter(starMesh, BABYLON.PhysicsImpostor.BoxImpostor, {
            mass: 10,
            friction: 2,
            restitution: 0.1,
        })

        const sphere = BABYLON.Mesh.CreateSphere('sphereJoint', 4, 0.8, scene)
        sphere.visibility = 0
        sphere.position.set(0, 40, 0)
        setPhysicsImposter(sphere, BABYLON.PhysicsImpostor.SphereImpostor, {
            mass: 0,
        })

        // make link
        const links = createChain(sphere, starMesh, { distance: -0.8, count: 3, mass: 1 })

        // set star position so it falls into screen
        starMesh.position.set(0.01, 42, 0)

        // setup camera goal. goal is slighted behind star to create smooth transitionTo
        const goal = BABYLON.Mesh.CreateBox('camera-goal', 1, scene)
        goal.position = starMesh.position
        goal.isVisible = false

        // light attached to star
        const starLight = new BABYLON.PointLight('star-light', starMesh.position, scene)
        starLight.intensity = 0.1
        starLight.diffuse = new BABYLON.Color3(1, 1, 0.8)
        starLight.specular = BABYLON.Color3.Black()
        starLight.shadowEnabled = false

        // particle field following star
        const pField = BABYLON.Mesh.CreateBox('particle-field', 1, scene)
        pField.isVisible = false

        //goal and light follow star
        scene.registerBeforeRender(() => {
            goal.position = BABYLON.Vector3.Lerp(goal.position, starMesh.position, 0.1)
            starLight.position = starMesh.position
            pField.position.x = goal.position.x
            pField.position.z = goal.position.z
            pField.position.y = 0
        })

        // particle systems
        const ps = createBlinkParticleSystem(150, new BABYLON.Texture(star, scene))
        ps.emitter = starMesh
        const ps2 = createStarField(200, new BABYLON.Texture(starRound, scene))
        const ps3 = createStarField(600, new BABYLON.Texture(flare, scene))
        ps2.start()
        ps3.start()

        const gp = new BABYLON.GPUParticleSystem(
            'gp',
            { capacity: 50, randomTextureSize: 1024 },
            scene
        )
        const noiseTexture = new BABYLON.NoiseProceduralTexture('perlin', 256, scene)
        noiseTexture.animationSpeedFactor = 2
        noiseTexture.brightness = 0.5
        noiseTexture.octaves = 5
        gp.noiseTexture = noiseTexture

        gp.noiseStrength = new BABYLON.Vector3(1, 1, 1)
        gp.emitRate = 10
        gp.minLifeTime = 3
        gp.maxLifeTime = 7
        gp.createBoxEmitter(
            new BABYLON.Vector3(0, 1, 0),
            BABYLON.Vector3.Zero(),
            new BABYLON.Vector3(-10, 2, -10),
            new BABYLON.Vector3(10, 0.1, 10)
        )
        gp.emitter = pField
        gp.particleTexture = new BABYLON.Texture(flare, scene)
        gp.updateSpeed = 0.01
        gp.minSize = 0.05
        gp.maxSize = 0.05

        gp.addColorGradient(0, new BABYLON.Color4(0, 0, 0, 0))
        gp.addColorGradient(
            0.2,
            new BABYLON.Color4(0.4, 0.3, 0.8, 1),
            new BABYLON.Color4(0.2, 0.9, 0.8, 1)
        )
        gp.addColorGradient(0.8, new BABYLON.Color4(0.8, 0.8, 0.2, 1))
        gp.addColorGradient(1, new BABYLON.Color4(0, 0, 0, 0))

        gp.addSizeGradient(0, 0.2)
        gp.addSizeGradient(0.3, 0.02)
        gp.addSizeGradient(0.7, 0.15)
        gp.addSizeGradient(1, 0.02)

        gp.maxEmitPower = 0
        gp.minEmitPower = 0
        gp.start()

        // animations
        const starLightAnimation = createBlinkAnimation(0.2)

        // actions
        const fall = async () => {
            links.forEach((link) => link.dispose())
            ps.start()
            camera.lockedTarget = goal
            let resolve // resolve when beta animation finishes
            const promise = new Promise((res) => (resolve = res))
            createTransition(camera, 'beta', Math.PI / 4, 20).then(() => {
                resolve(1)
                createTransition(camera, 'alpha', (3 / 4) * Math.PI, 55)
            })
            return promise
        }

        starMesh.actionManager = new BABYLON.ActionManager(scene)
        const fallingStarAction = starMesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger,
                async ({ source }) => {
                    source.actionManager.unregisterAction(fallingStarAction) // this action removes itself
                    fall()
                    // camera.attachControl(canvas, true)
                }
            )
        )
        starMesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(
                {
                    trigger: BABYLON.ActionManager.OnIntersectionEnterTrigger,
                    parameter: {
                        mesh: environment?.ground,
                        usePreciseIntersection: true,
                    },
                },
                throttle(
                    () => {
                        console.log('bounce')
                        ps2.dispose()
                        ps3.dispose()
                        scene.beginDirectAnimation(starLight, [starLightAnimation], 0, 10)
                        ding.play()
                        ps.start()
                    },
                    100,
                    { trailing: false }
                )
            )
        )

        // const fallingStars: any = []
        // for (let i = 0; i < 100; i++) {
        //     //@ts-ignore
        //     const cloneStar = starMesh.createInstance(`clone-star${i}`) // createInstance method exists
        //     cloneStar.position.set(
        //         randomRange(-5, 5),
        //         randomRange(50, 60 + i / 5),
        //         randomRange(-5, 5)
        //     )
        //     cloneStar.rotation = new BABYLON.Vector3(
        //         randomRange(0, 2 * Math.PI),
        //         randomRange(0, 2 * Math.PI),
        //         randomRange(0, 2 * Math.PI)
        //     )
        //     // cloneStar.isVisible = false
        //     setPhysicsImposter(cloneStar, BABYLON.PhysicsImpostor.BoxImpostor, {
        //         mass: 1,
        //         friction: 2,
        //         restitution: 0.1,
        //     })
        //     fallingStars.push(cloneStar)
        // }
        // let i = 0
        // setInterval(() => {
        //     fallingStars[i].isVisible = true
        //     setPhysicsImposter(fallingStars[i], BABYLON.PhysicsImpostor.BoxImpostor, {
        //         mass: 1,
        //         friction: 2,
        //         restitution: 0.1,
        //     })
        //     i += 1
        // }, 5000)

        scene.getEngine().hideLoadingUI()
        useStore.getState().actions.setReady()
        // @ts-ignore
        useStore.setState((state) => (state.actions.fall = fall))
        console.log('Ready')
    }, [])

    const onRender = useCallback((scene) => void 0, [])

    return <BabylonScene antialias onSceneReady={onSceneReady} onRender={onRender} />
}

export default SceneViewer
