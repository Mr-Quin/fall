/**
 * Environment is the container of all stars and constellations
 */

import {
    ActionManager,
    ArcRotateCamera,
    Camera,
    Color3,
    ExecuteCodeAction,
    HemisphericLight,
    Light,
    Mesh,
    MeshBuilder,
    Vector3,
} from '@babylonjs/core'
import Constellation from './Constellation'

interface Environment {
    camera: Camera
    light: Light
    ground: Mesh
    createCamera(): this
    createLight(): this
    createGround(): this
}

class Environment implements Environment {
    private readonly _scene: any
    private readonly _canvas: any
    private readonly _constellation: Constellation

    constructor(scene, canvas) {
        this._scene = scene
        this._canvas = canvas
        this._constellation = new Constellation(this._scene)
    }

    set sceneColor(color: Color3) {
        this._scene.clearColor = color
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
        const ground = MeshBuilder.CreateGround('ground', { width: 6, height: 6 }, this._scene)
        ground.actionManager = new ActionManager(this._scene)
        ground.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, (e) => {
                const { pickedPoint } = this._scene.pick(e.pointerX, e.pointerY, (mesh) => {
                    return mesh === ground
                })
                pickedPoint && this._constellation.addStar(pickedPoint, 0.5)
            })
        )
        this.ground = ground
        return this
    }
}

export default Environment
