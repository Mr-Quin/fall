import * as BABYLON from '@babylonjs/core'
import create from 'zustand'
import useStore from './store'
import * as BABYLONGUI from '@babylonjs/gui'
import * as BABYLONMAT from '@babylonjs/materials'
import { flare } from '../assets'

// pull from other store, subscribe to changes
let { scene, canvas, camera } = useStore.getState().statics
useStore.subscribe(
    (state) => void ({ scene, canvas, camera } = state as any),
    (state) => state.statics
)

interface ChainParams {
    count: number
    distance: number
    mass: number
}

type HelperState = {
    optimizeScene: () => void
    toggleOverlay: () => void
    enableDebugMetrics: () => void
    createGlow: () => BABYLON.GlowLayer
    createCamera: () => BABYLON.Camera
    createGround: () => BABYLON.Mesh
    createEmissiveMaterial: (color: BABYLON.Color3) => BABYLON.PBRMetallicRoughnessMaterial
    createRiseAnimation: (from: BABYLON.Vector3, to: BABYLON.Vector3) => BABYLON.Animation
    createBlinkAnimation: (orig: any) => BABYLON.Animation
    createLight: () => BABYLON.Light
    createAmbientParticleSystem: (texture: BABYLON.Texture) => BABYLON.GPUParticleSystem
    createCollisionParticleSystem: (
        capacity: number,
        texture: BABYLON.Texture
    ) => BABYLON.ParticleSystem
    createStarField: (
        capacity: number,
        texture: BABYLON.Texture
    ) => BABYLON.ParticleSystem | BABYLON.GPUParticleSystem
    setPhysicsImposter: (
        object: BABYLON.AbstractMesh,
        type: number,
        options?: BABYLON.PhysicsImpostorParameters
    ) => BABYLON.PhysicsImpostor
    setActionManager: (mesh: BABYLON.AbstractMesh) => BABYLON.ActionManager
    addActions: (
        actionManager: BABYLON.ActionManager,
        actions: BABYLON.IAction | BABYLON.IAction[]
    ) => BABYLON.ActionManager
    createTransition: (object: BABYLON.Node, prop: string, to: any, speed: number) => Promise<any>
    createChain: (
        startMesh: BABYLON.AbstractMesh,
        endMesh: BABYLON.AbstractMesh,
        options?: Partial<ChainParams>
    ) => BABYLON.AbstractMesh[]
}

/**
 * TODO: Probably should split this into sections
 *       like material, texture, particle system, etc.
 */
/**
 * Turn some imperative code into functions
 */
const useHelperStore = create<HelperState>((set, get) => ({
    optimizeScene: () => {
        scene!.autoClear = false // Color buffer
        scene!.autoClearDepthAndStencil = false // Depth and stencil, obviously
    },

    toggleOverlay: () => {
        const showing = scene!.debugLayer.isVisible()
        scene!.debugLayer.show({ overlay: !showing })
    },

    enableDebugMetrics: () => {
        const advancedTexture = BABYLONGUI.AdvancedDynamicTexture.CreateFullscreenUI('UI')
        const stackPanel = new BABYLONGUI.StackPanel()
        stackPanel.verticalAlignment = BABYLONGUI.Control.VERTICAL_ALIGNMENT_TOP
        stackPanel.isVertical = true
        advancedTexture.addControl(stackPanel)
        const frameTime = new BABYLONGUI.TextBlock()
        const averageFrameTime = new BABYLONGUI.TextBlock()
        const shaderTime = new BABYLONGUI.TextBlock()
        const shaderCount = new BABYLONGUI.TextBlock()
        const fps = new BABYLONGUI.TextBlock()

        const applyTextStyles = (textBlocks) =>
            void textBlocks.forEach((textBlock) => {
                textBlock.text = ''
                textBlock.color = 'white'
                textBlock.fontSize = 16
                textBlock.height = '30px'
                stackPanel.addControl(textBlock)
            })

        applyTextStyles([frameTime, averageFrameTime, shaderTime, shaderCount, fps])

        const engine = scene!.getEngine()
        const instrumentation = new BABYLON.EngineInstrumentation(engine)

        instrumentation.captureGPUFrameTime = true
        instrumentation.captureShaderCompilationTime = true

        scene!.registerBeforeRender(() => {
            frameTime.text = `Current frame time (GPU): ${(
                instrumentation.gpuFrameTimeCounter.current * 0.000001
            ).toFixed(2)} ms`
            averageFrameTime.text = `Average frame time (GPU): ${(
                instrumentation.gpuFrameTimeCounter.average * 0.000001
            ).toFixed(2)} ms`
            shaderTime.text = `Total shader compilation time: ${instrumentation.shaderCompilationTimeCounter.total.toFixed(
                2
            )} ms`
            shaderCount.text = `Compiler shaders count: ${instrumentation.shaderCompilationTimeCounter.count}`
            fps.text = `FPS: ${engine.getFps().toFixed()}`
        })
    },

    createGlow: () => {
        return new BABYLON.GlowLayer('glow', scene!, { mainTextureSamples: 2 })
    },

    createCamera: () => {
        const camera = new BABYLON.ArcRotateCamera(
            'Camera',
            1.65,
            3.14,
            30,
            new BABYLON.Vector3(0, 0, 0),
            scene!
        )
        camera.setPosition(new BABYLON.Vector3(5, 10, 20))
        camera.lowerRadiusLimit = 10
        return camera
    },

    createGround: () => {
        const ground = BABYLON.MeshBuilder.CreateGround(
            'grid-ground',
            { width: 50, height: 50 },
            scene!
        )
        // ground.rotation.z = 0.3
        ground.physicsImpostor = new BABYLON.PhysicsImpostor(
            ground,
            BABYLON.PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0.9 },
            scene!
        )
        const groundMat = new BABYLONMAT.GridMaterial('grid-material', scene!)

        groundMat.majorUnitFrequency = 5
        groundMat.minorUnitVisibility = 0.45
        groundMat.gridRatio = 1
        groundMat.opacity = 0.6
        groundMat.mainColor = new BABYLON.Color3(1, 1, 1)
        groundMat.lineColor = new BABYLON.Color3(1, 1, 1)
        groundMat.backFaceCulling = false
        // ground.material = groundMat
        return ground
    },

    createEmissiveMaterial: (color): BABYLON.PBRMetallicRoughnessMaterial => {
        const material = new BABYLON.PBRMetallicRoughnessMaterial('material', scene!)
        material.emissiveColor = color
        material.baseColor = BABYLON.Color3.White()
        material.roughness = 1
        return material
    },

    createRiseAnimation: (from, to) => {
        const animation = new BABYLON.Animation(
            'rise animation',
            'position',
            30,
            BABYLON.Animation.ANIMATIONTYPE_VECTOR3,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        )
        const easingFunction = new BABYLON.SineEase()
        easingFunction.setEasingMode(BABYLON.EasingFunction.EASINGMODE_EASEINOUT)
        animation.setEasingFunction(easingFunction)
        const moveKeys = [
            {
                frame: 0,
                value: from,
                outTangent: new BABYLON.Vector3(0, 1, 0),
            },
            {
                frame: 300,
                inTangent: new BABYLON.Vector3(0, 0, 0),
                value: to,
            },
        ]
        animation.setKeys(moveKeys)

        return animation
    },

    createBlinkAnimation: (orig) => {
        const animation = new BABYLON.Animation(
            'blink-animation',
            'intensity',
            30,
            BABYLON.Animation.ANIMATIONTYPE_FLOAT,
            BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE
        )
        const blinkKeys = [
            {
                frame: 0,
                value: orig,
            },
            {
                frame: 5,
                value: 0.5,
            },
            {
                frame: 10,
                value: orig,
            },
        ]
        animation.setKeys(blinkKeys)

        return animation
    },

    createLight: () => {
        const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), scene!)
        light.intensity = 0.5
        light.range = 1
        light.diffuse = new BABYLON.Color3(0.05, 0, 0.2)
        return light
    },

    createCollisionParticleSystem: (capacity, texture) => {
        const particleSystem = new BABYLON.ParticleSystem('star-collision', capacity, scene!)
        // emitter
        particleSystem.createPointEmitter(BABYLON.Vector3.Zero(), BABYLON.Vector3.Zero())
        // texture
        particleSystem.particleTexture = texture
        // color
        particleSystem.color1 = new BABYLON.Color4(0.95, 0.9, 0.4, 1)
        particleSystem.color2 = new BABYLON.Color4(1, 0.7, 0, 1)
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0)
        // size
        particleSystem.minSize = 0.2
        particleSystem.maxSize = 0.4
        // lifetime
        particleSystem.minLifeTime = 0.7
        particleSystem.maxLifeTime = 1
        // emission power
        particleSystem.minEmitPower = 1
        particleSystem.maxEmitPower = 1
        // speed gradient
        particleSystem.addVelocityGradient(0, 3, 6)
        particleSystem.addVelocityGradient(1.0, -0.5, -1)
        // drag gradient
        particleSystem.addDragGradient(0, 0.3)
        particleSystem.addDragGradient(1, 0.7)
        // rotation
        particleSystem.minAngularSpeed = -Math.PI * 2
        particleSystem.maxAngularSpeed = Math.PI * 2
        // direction
        particleSystem.direction1 = new BABYLON.Vector3(-1, -1, -1)
        particleSystem.direction2 = new BABYLON.Vector3(1, 1, 1)
        // gravity
        particleSystem.gravity = new BABYLON.Vector3(0, 0, 0)
        // emission rate
        particleSystem.manualEmitCount = 0
        particleSystem.emitRate = 0
        // set manualEmitCount to emit particles
        return particleSystem
    },

    createAmbientParticleSystem: (texture) => {
        const gpuParticleSystem = new BABYLON.GPUParticleSystem(
            'ambient-particles',
            { capacity: 50, randomTextureSize: 1024 },
            scene!
        )
        const noiseTexture = new BABYLON.NoiseProceduralTexture('perlin', 256, scene)
        noiseTexture.animationSpeedFactor = 2
        noiseTexture.brightness = 0.5
        noiseTexture.octaves = 5
        gpuParticleSystem.noiseTexture = noiseTexture

        gpuParticleSystem.noiseStrength = new BABYLON.Vector3(1, 1, 1)
        gpuParticleSystem.emitRate = 10
        gpuParticleSystem.minLifeTime = 3
        gpuParticleSystem.maxLifeTime = 7
        gpuParticleSystem.createBoxEmitter(
            new BABYLON.Vector3(0, 1, 0),
            BABYLON.Vector3.Zero(),
            new BABYLON.Vector3(-10, 2, -10),
            new BABYLON.Vector3(10, 0.1, 10)
        )
        gpuParticleSystem.particleTexture = texture
        gpuParticleSystem.updateSpeed = 0.01
        gpuParticleSystem.minSize = 0.05
        gpuParticleSystem.maxSize = 0.05

        gpuParticleSystem.addColorGradient(0, new BABYLON.Color4(0, 0, 0, 0))
        gpuParticleSystem.addColorGradient(
            0.2,
            new BABYLON.Color4(0.4, 0.3, 0.8, 1),
            new BABYLON.Color4(0.2, 0.9, 0.8, 1)
        )
        gpuParticleSystem.addColorGradient(0.8, new BABYLON.Color4(0.8, 0.3, 0.2, 1))
        gpuParticleSystem.addColorGradient(1, new BABYLON.Color4(0, 0, 0, 0))

        gpuParticleSystem.addSizeGradient(0, 0.2)
        gpuParticleSystem.addSizeGradient(0.3, 0.02)
        gpuParticleSystem.addSizeGradient(0.7, 0.15)
        gpuParticleSystem.addSizeGradient(1, 0.02)

        gpuParticleSystem.maxEmitPower = 0
        gpuParticleSystem.minEmitPower = 0

        return gpuParticleSystem
    },

    createStarField: (capacity, texture) => {
        const particleSystem = new BABYLON.GPUParticleSystem(
            'star-field',
            { capacity: capacity, randomTextureSize: 1024 },
            scene!
        )
        // create noise
        const noiseTexture = new BABYLON.NoiseProceduralTexture('perlin', 256, scene)
        noiseTexture.animationSpeedFactor = 1
        noiseTexture.brightness = 0.5
        noiseTexture.octaves = 2
        // apply noise
        particleSystem.noiseTexture = noiseTexture
        particleSystem.noiseStrength = new BABYLON.Vector3(0.2, 0.2, 0.2)
        // use mesh emitter
        particleSystem.createBoxEmitter(
            BABYLON.Vector3.Zero(),
            BABYLON.Vector3.Zero(),
            new BABYLON.Vector3(-20, 15, -20),
            new BABYLON.Vector3(20, 45, 0)
        )
        // texture
        particleSystem.particleTexture = texture
        // color
        particleSystem.color1 = new BABYLON.Color4(0.4, 0.2, 1, 1)
        particleSystem.color2 = new BABYLON.Color4(1, 0.7, 0, 1)
        particleSystem.colorDead = new BABYLON.Color4(0, 0, 0, 0)
        // size
        particleSystem.minSize = 0.05
        particleSystem.maxSize = 0.5
        // lifetime
        particleSystem.minLifeTime = 3600
        particleSystem.maxLifeTime = 3600
        // emission power
        particleSystem.minEmitPower = 0
        particleSystem.maxEmitPower = 0
        // rotation
        particleSystem.minAngularSpeed = -Math.PI
        particleSystem.maxAngularSpeed = Math.PI
        // gravity
        particleSystem.gravity = new BABYLON.Vector3(0, 0, 0)
        // manual emit
        particleSystem.emitRate = capacity
        return particleSystem
    },

    setPhysicsImposter: (object, type, options) => {
        return (object.physicsImpostor = new BABYLON.PhysicsImpostor(object, type, options, scene!))
    },

    setActionManager: (mesh) => {
        return (mesh.actionManager = new BABYLON.ActionManager(scene!))
    },

    addActions: (actionManager, actions) => {
        return actionManager
    },

    createTransition: (object, prop, to, speed) => {
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
    },

    createChain: (startMesh, endMesh, options) => {
        const defaultOptions: ChainParams = {
            count: 3,
            distance: 0.5,
            mass: 1,
        }

        if (options) {
            for (const key in options) {
                const value = options[key]
                defaultOptions[key] = value
            }
        }

        const { count, distance, mass } = defaultOptions

        const links: BABYLON.AbstractMesh[] = []
        const jointData = {
            mainPivot: new BABYLON.Vector3(0, -distance, 0),
            connectedPivot: new BABYLON.Vector3(0, distance, 0),
        }
        for (let i = 0; i < count; i++) {
            const link = BABYLON.Mesh.CreateBox('joint-box', 0.3, scene!).convertToUnIndexedMesh()

            link.position = new BABYLON.Vector3(
                startMesh.position.x,
                startMesh.position.y - (i + 1) * distance,
                startMesh.position.z
            )

            const physicsImposter = get().setPhysicsImposter(
                link,
                BABYLON.PhysicsImpostor.NoImpostor,
                {
                    mass: mass,
                }
            )

            links.push(link)

            if (i > 0) {
                links[i - 1].physicsImpostor!.createJoint(
                    physicsImposter,
                    BABYLON.PhysicsJoint.BallAndSocketJoint,
                    jointData
                )
            }
        }

        startMesh.physicsImpostor!.createJoint(
            links[0].physicsImpostor!,
            BABYLON.PhysicsJoint.BallAndSocketJoint,
            jointData
        )

        endMesh.position.copyFrom(links[links.length - 1].position)

        links[links.length - 1].physicsImpostor!.createJoint(
            endMesh.physicsImpostor!,
            BABYLON.PhysicsJoint.BallAndSocketJoint,
            jointData
        )

        return links
    },
}))

export default useHelperStore
