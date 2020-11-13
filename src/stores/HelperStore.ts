import create from 'zustand'
import useStore from './store'
import {
    AbstractMesh,
    ActionManager,
    ArcRotateCamera,
    Camera,
    Color3,
    Color4,
    CubicEase,
    EasingFunction,
    EngineInstrumentation,
    GlowLayer,
    GPUParticleSystem,
    HemisphericLight,
    IAction,
    Light,
    Mesh,
    MeshBuilder,
    NoiseProceduralTexture,
    ParticleSystem,
    PBRMetallicRoughnessMaterial,
    PhysicsImpostor,
    PhysicsImpostorParameters,
    PhysicsJoint,
    SineEase,
    Texture,
    Vector3,
    Animation,
    Node,
    SceneInstrumentation,
} from '@babylonjs/core'

// pull from other store, subscribe to changes
let { scene } = useStore.getState().statics
useStore.subscribe(
    (state) => void ({ scene } = state as any),
    (state) => state.statics
)

type ChainOptions = {
    count: number
    distance: number
    mass: number
    hideChains: boolean
}

type HelperState = {
    addActions: (actionManager: ActionManager, actions: IAction | IAction[]) => ActionManager
    createBlinkAnimation: (orig: any) => Animation
    createCamera: () => Camera
    createChain: (
        startMesh: AbstractMesh,
        endMesh: AbstractMesh,
        options?: Partial<ChainOptions>
    ) => AbstractMesh[]
    createEmissiveMaterial: (color: Color3) => PBRMetallicRoughnessMaterial
    createGlow: () => GlowLayer
    createGround: () => Mesh
    createLight: () => Light
    createRiseAnimation: (from: Vector3, to: Vector3) => Animation
    createTransition: (object: Node, prop: string, to: any, speed: number) => Promise<any>
    enableDebugMetrics: () => void
    setActionManager: (mesh: AbstractMesh) => ActionManager
    setPhysicsImposter: (
        object: AbstractMesh,
        type: number,
        options?: PhysicsImpostorParameters
    ) => PhysicsImpostor
    toggleOverlay: () => void
}

/**
 * NOT USED ANYMORE
 */
/**
 * Turn some imperative code into functions
 */
const useHelperStore = create<HelperState>((set, get) => ({
    addActions: (actionManager, actions) => {
        return actionManager
    },

    createBlinkAnimation: (orig) => {
        const animation = new Animation(
            'blink-animation',
            'intensity',
            30,
            Animation.ANIMATIONTYPE_FLOAT,
            Animation.ANIMATIONLOOPMODE_CYCLE
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

    createCamera: () => {
        const camera = new ArcRotateCamera('Camera', 1.65, 3.14, 30, new Vector3(0, 0, 0), scene!)
        camera.setPosition(new Vector3(5, 10, 20))
        camera.lowerRadiusLimit = 10
        return camera
    },

    createChain: (startMesh, endMesh, options) => {
        const defaultOptions: ChainOptions = {
            count: 3,
            distance: 0.5,
            mass: 1,
            hideChains: false,
        }

        if (options) {
            for (const key in options) {
                defaultOptions[key] = options[key]
            }
        }

        const { count, distance, mass, hideChains } = defaultOptions

        const links: AbstractMesh[] = []
        const jointData = {
            mainPivot: new Vector3(0, -distance, 0),
            connectedPivot: new Vector3(0, distance, 0),
        }
        for (let i = 0; i < count; i++) {
            const link = Mesh.CreateBox(`joint-box-${i}`, 0.3, scene!).convertToUnIndexedMesh()
            link.isVisible = !hideChains

            link.position = new Vector3(
                startMesh.position.x,
                startMesh.position.y - (i + 1) * distance,
                startMesh.position.z
            )

            const physicsImposter = get().setPhysicsImposter(link, PhysicsImpostor.BoxImpostor, {
                mass: mass,
            })

            links.push(link)

            if (i > 0) {
                links[i - 1].physicsImpostor!.createJoint(
                    physicsImposter,
                    PhysicsJoint.BallAndSocketJoint,
                    jointData
                )
            }
        }

        startMesh.physicsImpostor!.createJoint(
            links[0].physicsImpostor!,
            PhysicsJoint.BallAndSocketJoint,
            jointData
        )

        endMesh.position.copyFrom(links[links.length - 1].position)

        links[links.length - 1].physicsImpostor!.createJoint(
            endMesh.physicsImpostor!,
            PhysicsJoint.BallAndSocketJoint,
            jointData
        )

        return links
    },

    createEmissiveMaterial: (color): PBRMetallicRoughnessMaterial => {
        const material = new PBRMetallicRoughnessMaterial('material', scene!)
        material.emissiveColor = color
        material.baseColor = Color3.White()
        return material
    },

    createGlow: () => {
        return new GlowLayer('glow', scene!, { mainTextureSamples: 2 })
    },

    createGround: () => {
        const ground = MeshBuilder.CreateGround('grid-ground', { width: 50, height: 50 }, scene!)
        ground.physicsImpostor = new PhysicsImpostor(
            ground,
            PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0.9 },
            scene!
        )
        let groundMat

        import('@babylonjs/materials').then((BABYLONMAT) => {
            groundMat = new BABYLONMAT.GridMaterial('grid-material', scene!)
            groundMat.majorUnitFrequency = 5
            groundMat.minorUnitVisibility = 0.45
            groundMat.gridRatio = 1
            groundMat.opacity = 0.6
            groundMat.mainColor = new Color3(1, 1, 1)
            groundMat.lineColor = new Color3(1, 1, 1)
            groundMat.backFaceCulling = false
        })
        // ground.material = groundMat
        return ground
    },

    createLight: () => {
        const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene!)
        light.intensity = 0.5
        light.range = 1
        light.diffuse = new Color3(0.05, 0, 0.2)
        return light
    },

    createRiseAnimation: (from, to) => {
        const animation = new Animation(
            'rise animation',
            'position',
            30,
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CYCLE
        )
        const easingFunction = new SineEase()
        easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT)
        animation.setEasingFunction(easingFunction)
        const moveKeys = [
            {
                frame: 0,
                value: from,
                outTangent: new Vector3(0, 1, 0),
            },
            {
                frame: 300,
                inTangent: new Vector3(0, 0, 0),
                value: to,
            },
        ]
        animation.setKeys(moveKeys)

        return animation
    },

    createTransition: (object, prop, to, speed) => {
        const ease = new CubicEase()
        ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT)

        return new Promise((res, rej) => {
            Animation.CreateAndStartAnimation(
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

    enableDebugMetrics: async () => {
        const BABYLONGUI = await import('@babylonjs/gui')
        const advancedTexture = BABYLONGUI.AdvancedDynamicTexture.CreateFullscreenUI('UI')
        const stackPanel = new BABYLONGUI.StackPanel()
        stackPanel.verticalAlignment = BABYLONGUI.Control.VERTICAL_ALIGNMENT_TOP
        stackPanel.topInPixels = 30
        stackPanel.isVertical = true
        advancedTexture.addControl(stackPanel)
        const frameTime = new BABYLONGUI.TextBlock()
        const averageFrameTime = new BABYLONGUI.TextBlock()
        const shaderTime = new BABYLONGUI.TextBlock()
        const shaderCount = new BABYLONGUI.TextBlock()
        const physicsTime = new BABYLONGUI.TextBlock()
        const fps = new BABYLONGUI.TextBlock()

        const applyTextStyles = (textBlocks) =>
            void textBlocks.forEach((textBlock) => {
                textBlock.text = ''
                textBlock.color = 'white'
                textBlock.fontSize = 16
                textBlock.height = '30px'
                stackPanel.addControl(textBlock)
            })

        applyTextStyles([frameTime, averageFrameTime, shaderTime, shaderCount, physicsTime, fps])

        const engine = scene!.getEngine()
        const engineInstrumentation = new EngineInstrumentation(engine)
        const sceneInstrumentation = new SceneInstrumentation(scene!)

        engineInstrumentation.captureGPUFrameTime = true
        engineInstrumentation.captureShaderCompilationTime = true
        sceneInstrumentation.capturePhysicsTime = true

        scene!.registerBeforeRender(() => {
            frameTime.text = `Current frame time (GPU): ${(
                engineInstrumentation.gpuFrameTimeCounter.current * 0.000001
            ).toFixed(2)} ms`
            averageFrameTime.text = `Average frame time (GPU): ${(
                engineInstrumentation.gpuFrameTimeCounter.average * 0.000001
            ).toFixed(2)} ms`
            shaderTime.text = `Total shader compilation time: ${engineInstrumentation.shaderCompilationTimeCounter.total.toFixed(
                2
            )} ms`
            shaderCount.text = `Compiler shaders count: ${engineInstrumentation.shaderCompilationTimeCounter.count}`
            physicsTime.text = `Current physics time: ${sceneInstrumentation.physicsTimeCounter.current.toFixed(
                2
            )} ms`
            fps.text = `FPS: ${engine.getFps().toFixed()}`
        })
    },

    setActionManager: (mesh) => {
        return (mesh.actionManager = new ActionManager(scene!))
    },

    setPhysicsImposter: (object, type, options) => {
        return (object.physicsImpostor = new PhysicsImpostor(object, type, options, scene!))
    },

    toggleOverlay: async () => {
        await import('@babylonjs/inspector')
        await import('@babylonjs/core/Debug/debugLayer')
        const showing = scene!.debugLayer.isVisible()
        await scene!.debugLayer.show({ overlay: !showing })
    },
}))

export default useHelperStore
