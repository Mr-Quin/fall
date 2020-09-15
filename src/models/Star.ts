/**
 * Star is a BabylonJS sphere mesh with material, actions, animations, and ToneJS synth
 */

import {
    ActionManager,
    Color3,
    Vector3,
    Mesh,
    PBRMetallicRoughnessMaterial,
    Animation,
    EasingFunction,
    SineEase,
    Action,
    InterpolateValueAction,
    ExecuteCodeAction,
    ParticleSystem,
    GPUParticleSystem,
} from '@babylonjs/core'
import { v4 as uuidv4 } from 'uuid'
import { FMSynth, Transport } from 'tone'
import { randomFromArray } from '../utils/utils'

interface Star {
    name: string
    mesh: Mesh
    octave: number
    material: PBRMetallicRoughnessMaterial
    animation: Animation
    blinkAnimation: Animation
    colorAction: Action
    synthAction: Action
    particleSystem: ParticleSystem | GPUParticleSystem
    rise(): void
    blink(note?: string): void
    onRiseEnd(): void
    onBlinkEnd(): void
    dispose(): void
}

class Star implements Star {
    private readonly _scene
    private readonly _synth: FMSynth
    private readonly _groundPos: Vector3
    private readonly _skyPos: Vector3
    private readonly _toColor: Color3
    private _ready: boolean

    constructor(
        initPosition = Vector3.Zero(),
        destPosition,
        diameter = 0.5,
        toColor,
        octave = 4,
        scene
    ) {
        this._synth = new FMSynth({
            harmonicity: 8,
            modulationIndex: 2,
            oscillator: {
                type: 'sine',
            },
            envelope: {
                attack: 0.001,
                decay: 2,
                sustain: 0.1,
                release: 2,
            },
            modulation: {
                type: 'square',
            },
            modulationEnvelope: {
                attack: 0.002,
                decay: 0.2,
                sustain: 0,
                release: 0.2,
            },
        }).toDestination()
        this._scene = scene
        this._groundPos = initPosition
        this._skyPos = destPosition
        this._toColor = toColor
        this._ready = false
        this.name = uuidv4()
        this.octave = octave
        this.mesh = Mesh.CreateSphere(this.name, 32, diameter, scene)
        this.mesh.position = initPosition
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

    setAction = (scene): this => {
        this.colorAction = new InterpolateValueAction(
            ActionManager.NothingTrigger,
            this.material,
            'emissiveColor',
            this._toColor,
            1000
        )
        this.synthAction = new ExecuteCodeAction(
            {
                trigger: ActionManager.NothingTrigger,
            },
            () => {
                this._synth.triggerAttackRelease(
                    randomFromArray(['C3', 'C4', 'C5', 'E3', 'E4', 'E5', 'G3', 'G4', 'G5']),
                    '4n'
                )
                this.particleSystem.start()
                this._scene.beginDirectAnimation(this.mesh, [this.blinkAnimation], 0, 15, false, 1)
            }
        )
        this.mesh.actionManager = new ActionManager(scene)
        this.mesh.actionManager.registerAction(this.colorAction)
        this.mesh.actionManager.registerAction(this.synthAction)
        return this
    }

    setAnimation = () => {
        this.mesh.animations = []
        this.animation = new Animation(
            `${this.name}-move`,
            'position',
            30,
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CYCLE
        )
        const easingFunction = new SineEase()
        easingFunction.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT)
        this.animation.setEasingFunction(easingFunction)
        const moveKeys = [
            {
                frame: 0,
                value: this._groundPos,
                outTangent: new Vector3(0, 1, 0),
            },
            {
                frame: 300,
                inTangent: new Vector3(0, 0, 0),
                value: this._skyPos,
            },
        ]
        this.animation.setKeys(moveKeys)
        this.mesh.animations.push(this.animation)

        this.blinkAnimation = new Animation(
            `${this.name}-blink`,
            'scaling',
            30,
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CYCLE
        )
        const blinkKeys = [
            {
                frame: 0,
                value: this.scaling,
            },
            {
                frame: 5,
                value: new Vector3(1.5, 1.5, 1.5),
            },
            {
                frame: 10,
                value: this.scaling,
            },
        ]
        this.blinkAnimation.setKeys(blinkKeys)
        this.mesh.animations.push(this.blinkAnimation)
        return this
    }

    setParticleSystem = (ps: ParticleSystem) => {
        ps.emitter = this.mesh
        this.particleSystem = ps
        return this
    }

    setMaterial = (mat: PBRMetallicRoughnessMaterial) => {
        this.mesh.material = mat
        this.material = mat
        return this
    }

    rise = (): void => {
        this._scene.beginDirectAnimation(
            this.mesh,
            [this.animation],
            0,
            300,
            false,
            1,
            this.onRiseEnd
        )
    }

    blink = (note = 'C4'): void => {
        // this.synthAction.execute()
        this._synth.triggerAttackRelease(note, '4n')
        this.particleSystem.start()
        this._scene.beginDirectAnimation(this.mesh, [this.blinkAnimation], 0, 15, false, 1)
    }

    onRiseEnd = () => {
        this.colorAction.execute()
        this._ready = true
    }

    onBlinkEnd = () => {}

    dispose = () => {}
}

export default Star
