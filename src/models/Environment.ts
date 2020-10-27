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
    Vector3,
    EngineInstrumentation,
    GlowLayer,
    Scene,
    PhysicsImpostor,
    AmmoJSPlugin,
    FollowCamera,
    AbstractMesh,
    ArcFollowCamera,
} from '@babylonjs/core'
import '@babylonjs/inspector'
import { GridMaterial } from '@babylonjs/materials'
import { AdvancedDynamicTexture, Control, StackPanel, TextBlock } from '@babylonjs/gui'

interface Environment {
    new (scene: Scene, canvas: HTMLCanvasElement): Environment
    camera: ArcRotateCamera
    light: Light
    ground: Mesh
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
        this._ready = true
        this._scene.enablePhysics(new Vector3(0, -9.8, 0), new AmmoJSPlugin())
        this._onLoad()
    }

    private _onLoad = () => {}

    get ready() {
        return this._ready
    }

    set sceneColor(color: Color3) {
        this._scene.clearColor = color
    }

    set keys(keys: string[]) {
        this._keys = keys
    }

    createCamera = () => {
        // const camera = new ArcRotateCamera('Camera', 0, 0, 5, new Vector3(0, 0, 0), this._scene)
        const camera = new ArcRotateCamera(
            'Camera',
            1.65,
            3.14,
            30,
            new Vector3(0, 0, 0),
            this._scene
        )
        camera.setPosition(new Vector3(5, 10, 20))
        // camera.setTarget(Vector3.Zero())
        // camera.lockedTarget = target
        camera.attachControl(this._canvas, true)
        // camera.lowerRadiusLimit = 5
        this.camera = camera
        return this
    }

    createLight = () => {
        const light = new HemisphericLight('light', new Vector3(0, 1, 0), this._scene)
        light.intensity = 0.5
        light.range = 1
        light.diffuse = new Color3(0.05, 0, 0.2)
        this.light = light
        return this
    }

    createGround = () => {
        const ground = MeshBuilder.CreateGround(
            'grid-ground',
            { width: 50, height: 50 },
            this._scene
        )
        // ground.rotation.z = 0.3
        ground.physicsImpostor = new PhysicsImpostor(
            ground,
            PhysicsImpostor.BoxImpostor,
            { mass: 0, restitution: 0.9 },
            this._scene
        )
        const groundMat = new GridMaterial('grid-material', this._scene)

        groundMat.majorUnitFrequency = 5
        groundMat.minorUnitVisibility = 0.45
        groundMat.gridRatio = 1
        groundMat.opacity = 0.6
        groundMat.mainColor = new Color3(1, 1, 1)
        groundMat.lineColor = new Color3(1, 1, 1)
        groundMat.backFaceCulling = false
        // ground.material = groundMat
        this.ground = ground
        return this
    }

    createEffects = () => {
        const glow = new GlowLayer('glow', this._scene, { mainTextureSamples: 2 })
        return glow
    }
}

export default Environment
