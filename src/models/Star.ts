/**
 * Star is a BabylonJS sphere mesh with material, actions, animations
 */

import {
    ActionManager,
    Color3,
    Vector3,
    Mesh,
    PBRMetallicRoughnessMaterial,
    Animation,
    Action,
    InterpolateValueAction,
    ParticleSystem,
    GPUParticleSystem,
} from '@babylonjs/core'
import { v4 as uuidv4 } from 'uuid'

interface Star {
    name: string
    mesh: Mesh
    octave: number
    material: PBRMetallicRoughnessMaterial
    riseAnimation: Animation
    blinkAnimation: Animation
    colorAction: Action
    particleSystem: ParticleSystem | GPUParticleSystem
    rise(): void
    blink(): void
    onRiseEnd(): void
    onBlinkEnd(): void
    dispose(): void
}

class Star implements Star {
    private readonly _scene
    private readonly _groundPos: Vector3
    private readonly _skyPos: Vector3
    private readonly _toColor: Color3
    private _ready: boolean
    private _onReady: any

    constructor(
        initPosition = Vector3.Zero(),
        destPosition,
        diameter = 0.5,
        toColor,
        octave = 4,
        scene,
        onReady
    ) {
        this._scene = scene
        this._groundPos = initPosition
        this._skyPos = destPosition
        this._toColor = toColor
        this._ready = false
        this._onReady = onReady
        this.name = uuidv4()
        this.octave = octave
        this.mesh = Mesh.CreateSphere(this.name, 32, diameter, scene)
        this.mesh.position = initPosition
        this.mesh.animations = []
        setTimeout(this.rise, 300)
    }

    get position(): Vector3 {
        return this.mesh.position
    }

    get scaling(): Vector3 {
        return this.mesh.scaling
    }

    get isReady(): boolean {
        return this._ready
    }

    get color(): Color3 {
        return this.material.emissiveColor
    }

    setAction = (): this => {
        this.colorAction = new InterpolateValueAction(
            ActionManager.NothingTrigger,
            this.material,
            'emissiveColor',
            this._toColor,
            1000
        )
        this.mesh.actionManager = new ActionManager(this._scene)
        this.mesh.actionManager.registerAction(this.colorAction)
        return this
    }

    attachRiseAnimation = (animation: Animation) => {
        this.riseAnimation = animation
        this.mesh.animations.push(animation)
        return this
    }

    attachBlinkAnimation = (animation: Animation) => {
        this.blinkAnimation = animation
        this.mesh.animations.push(animation)
        return this
    }

    attachParticleSystem = (ps: ParticleSystem) => {
        ps.emitter = this.mesh
        this.particleSystem = ps
        return this
    }

    attachMaterial = (mat: PBRMetallicRoughnessMaterial) => {
        this.mesh.material = mat
        this.material = mat
        this.setAction()
        return this
    }

    rise = (): void => {
        this._scene.beginDirectAnimation(
            this.mesh,
            [this.riseAnimation],
            0,
            300,
            false,
            1,
            this.onRiseEnd
        )
    }

    blink = (): void => {
        this.particleSystem.start()
        this._scene.beginDirectAnimation(this.mesh, [this.blinkAnimation], 0, 15, false, 1)
    }

    onRiseEnd = () => {
        this.colorAction.execute()
        this._onReady(this.position)
        this._ready = true
    }

    onBlinkEnd = () => {}

    dispose = () => {}
}

export default Star
