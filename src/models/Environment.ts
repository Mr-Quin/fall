/**
 * Environment contains and manages all BabylonJS components
 */

import {
    ArcRotateCamera,
    Camera,
    Color3,
    HemisphericLight,
    Light,
    Mesh,
    MeshBuilder,
    StandardMaterial,
    Vector3,
    EngineInstrumentation,
    GlowLayer,
    Scene,
} from '@babylonjs/core'
import { AdvancedDynamicTexture, Control, StackPanel, TextBlock } from '@babylonjs/gui'
import { context, Transport } from 'tone'
import Space from './Space'

interface Environment {
    new (scene: Scene, canvas: HTMLCanvasElement): Environment
    camera: Camera
    light: Light
    ground: Mesh
    enableDebugMetrics(): void
    createCamera(): this
    createLight(): this
    createGround(): this
}

class Environment implements Environment {
    private readonly _scene: any
    private readonly _canvas: any
    private _ready: boolean
    private _keys

    constructor(scene, canvas) {
        this._ready = false
        this._scene = scene
        this._canvas = canvas
        this._init()
    }

    private _init = () => {
        // optimization
        this._scene.autoClear = false // Color buffer
        this._scene.autoClearDepthAndStencil = false // Depth and stencil, obviously
        this._onFinishLoading()
    }

    private _onFinishLoading = () => {
        this._ready = true
        context.resume()
    }

    get ready() {
        return this._ready
    }

    set sceneColor(color: Color3) {
        this._scene.clearColor = color
    }

    set keys(keys: string[]) {
        this._keys = keys
    }

    enableDebugMetrics = () => {
        const advancedTexture = AdvancedDynamicTexture.CreateFullscreenUI('UI')
        const stackPanel = new StackPanel()
        stackPanel.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP
        stackPanel.isVertical = true
        advancedTexture.addControl(stackPanel)
        const applyTextStyles = (textBlocks) => {
            textBlocks.forEach((textBlock) => {
                textBlock.text = ''
                textBlock.color = 'white'
                textBlock.fontSize = 16
                textBlock.height = '30px'
                stackPanel.addControl(textBlock)
            })
        }
        const frameTime = new TextBlock()
        const averageFrameTime = new TextBlock()
        const shaderTime = new TextBlock()
        const shaderCount = new TextBlock()
        applyTextStyles([frameTime, averageFrameTime, shaderTime, shaderCount])

        const instrumentation = new EngineInstrumentation(this._scene.getEngine())
        instrumentation.captureGPUFrameTime = true
        instrumentation.captureShaderCompilationTime = true

        this._scene.registerBeforeRender(() => {
            frameTime.text = `current frame time (GPU): ${(
                instrumentation.gpuFrameTimeCounter.current * 0.000001
            ).toFixed(2)} ms`
            averageFrameTime.text =
                'average frame time (GPU): ' +
                (instrumentation.gpuFrameTimeCounter.average * 0.000001).toFixed(2) +
                'ms'
            shaderTime.text =
                'total shader compilation time: ' +
                instrumentation.shaderCompilationTimeCounter.total.toFixed(2) +
                'ms'
            shaderCount.text =
                'compiler shaders count: ' + instrumentation.shaderCompilationTimeCounter.count
        })
    }

    createCamera = () => {
        const camera = new ArcRotateCamera('Camera', 0, 0, 5, new Vector3(0, 0, 0), this._scene)
        camera.setPosition(new Vector3(5, 10, 20))
        camera.setTarget(Vector3.Zero())
        camera.attachControl(this._canvas, true)
        camera.lowerRadiusLimit = 5
        this.camera = camera
        return this
    }

    createLight = () => {
        const light = new HemisphericLight('light', new Vector3(0, 1, 0), this._scene)
        light.intensity = 0.5
        this.light = light
        return this
    }

    createGround = () => {
        const ground = MeshBuilder.CreateGround('ground', { width: 8, height: 8 }, this._scene)
        const groundMat = new StandardMaterial('mat', this._scene)
        groundMat.wireframe = true
        ground.material = groundMat

        // for (let i = 1; i < 9; i++) {
        //     const points: any[] = []
        //     let angle = 0
        //     for (let j = 0; j < 32; j++) {
        //         angle += (Math.PI * 2) / 31
        //         points.push(new Vector3((i / 2) * Math.cos(angle), 0, (i / 2) * Math.sin(angle)))
        //     }
        //     Mesh.CreateLines('concentric', points, this._scene, true)
        // }
        // ground.actionManager = new ActionManager(this._scene)
        // ground.actionManager.registerAction(
        //     new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, (e) => {
        //         const { pickedPoint } = this._scene.pick(e.pointerX, e.pointerY, (mesh) => {
        //             return mesh === ground
        //         })
        //
        //         pickedPoint &&
        //             this._constellation.addStar(
        //                 pickedPoint,
        //                 randomBetween(0.1, 0.4),
        //                 randomBetween(2, 7) << 0
        //             )
        //     })
        // )
        this.ground = ground
        return this
    }

    createEffects = () => {
        const glow = new GlowLayer('glow', this._scene, { mainTextureSamples: 2 })
        return this
    }
}

export default Environment
