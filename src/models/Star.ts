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
    material: PBRMetallicRoughnessMaterial
    animation: Animation
    blinkAnimation: Animation
    colorAction: Action
    synthAction: Action
    particleSystem: ParticleSystem | GPUParticleSystem
    rise(): void
    shine(): void
    triggerSynth(): void
    onRiseEnd(): void
    onBlinkEnd(): void
    dispose(): void
}

class Star implements Star {
    private readonly _scene
    private readonly _synth: FMSynth

    constructor(initPosition = Vector3.Zero(), diameter = 0.5, scene) {
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
        this.name = uuidv4()
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

    get color(): Color3 {
        return this.material.emissiveColor
    }

    setAction = (scene): this => {
        this.colorAction = new InterpolateValueAction(
            ActionManager.NothingTrigger,
            this.material,
            'emissiveColor',
            Color3.White(),
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
                this.shine()
                this.blink()
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
                value: this.position,
                outTangent: new Vector3(0, 1, 0),
            },
            {
                frame: 300,
                inTangent: new Vector3(0, 0, 0),
                value: new Vector3(
                    -0.5 + Math.random(),
                    Math.abs(Math.random()),
                    -0.5 + Math.random()
                )
                    .normalize()
                    .scale(Math.max(30, Math.random() * 50)),
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

    rise = () => {
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

    blink = () => {
        this._scene.beginDirectAnimation(this.mesh, [this.blinkAnimation], 0, 15, false, 1)
    }

    shine = () => {
        this.particleSystem.start()
        // particle system has a stop delay set
    }

    onRiseEnd = () => {
        this.colorAction.execute()
        this.scheduleTransport()
    }

    onBlinkEnd = () => {}

    triggerSynth = () => {
        this.synthAction.execute()
    }

    scheduleTransport = () => {
        const schedule = Transport.scheduleRepeat((time) => {
            this.triggerSynth()
        }, '1n')
    }

    dispose = () => {}
}

export default Star
