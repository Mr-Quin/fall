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
    StandardMaterial,
    Vector3,
} from '@babylonjs/core'
import Constellation from './Constellation'
import { randomBetween, randomFromArray } from '../utils/utils'
import { Transport } from 'tone'

interface Environment {
    ready: boolean
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
    private _keys

    constructor(scene, canvas) {
        this.ready = false
        this._scene = scene
        this._canvas = canvas
        this._constellation = new Constellation(this._scene)
        this._startTransport()
    }

    private _startTransport = () => {
        let index = 0
        Transport.scheduleRepeat((time) => {
            if (!this._constellation.stars.length) return
            if (index === this._constellation.stars.length) index = 0
            let stars = this._constellation.stars[index]
            stars.forEach((star) => {
                star.isReady && star.blink(`${randomFromArray(this._keys)}${star.octave}`)
            })
            index += 1
        }, '8n')
    }

    set sceneColor(color: Color3) {
        this._scene.clearColor = color
    }

    set keys(keys: string[]) {
        this._keys = keys
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

        for (let i = 1; i < 9; i++) {
            const points: any[] = []
            let angle = 0
            for (let j = 0; j < 32; j++) {
                angle += (Math.PI * 2) / 31
                points.push(new Vector3((i / 2) * Math.cos(angle), 0, (i / 2) * Math.sin(angle)))
            }
            Mesh.CreateLines('concentric', points, this._scene, true)
        }
        ground.actionManager = new ActionManager(this._scene)
        ground.actionManager.registerAction(
            new ExecuteCodeAction(ActionManager.OnLeftPickTrigger, (e) => {
                const { pickedPoint } = this._scene.pick(e.pointerX, e.pointerY, (mesh) => {
                    return mesh === ground
                })

                pickedPoint &&
                    this._constellation.addStar(
                        pickedPoint,
                        randomBetween(0.1, 0.4),
                        randomBetween(2, 7) << 0
                    )
            })
        )
        this.ground = ground
        return this
    }
}

export default Environment
