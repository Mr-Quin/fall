/**
 * Star is a BabylonJS sphere mesh with material, actions, animations, and ToneJS synth
 */

import {
    ActionManager,
    Color3,
    Color4,
    Texture,
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
} from '@babylonjs/core'
import { v4 as uuidv4 } from 'uuid'
import { FMSynth, Transport } from 'tone'
import { randomFromArray } from '../utils/utils'

interface Star {
    name: string
    scene: any
    mesh: Mesh
    material: PBRMetallicRoughnessMaterial
    animation: Animation
    blinkAnimation: Animation
    colorAction: Action
    intersectionAction: Action
    particleSystem: ParticleSystem
    animate(): void
    executeAction(): void
}

class Star {
    private targetMesh: any
    private synth: FMSynth

    constructor(initPosition = Vector3.Zero(), diameter = 0.5, scene, mesh) {
        this.synth = new FMSynth({
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
        this.targetMesh = mesh
        this.name = uuidv4()
        this.scene = scene
        this.mesh = Mesh.CreateSphere(this.name, 32, diameter, scene)
        this._init(initPosition, scene)
    }

    private _init = (initPosition, scene): void => {
        this.mesh.position = initPosition
        this._materialSetup(scene)._animationSetup()._actionSetup(scene)
        setTimeout(this.rise, 300)
    }

    private _materialSetup = (scene): this => {
        this.material = new PBRMetallicRoughnessMaterial(this.name, scene)
        this.material.emissiveColor = new Color3(0.2, 0.2, 0)
        this.material.baseColor = Color3.White()
        this.material.roughness = 1
        this.mesh.material = this.material
        return this
    }

    private _actionSetup = (scene): this => {
        this.colorAction = new InterpolateValueAction(
            ActionManager.NothingTrigger,
            this.material,
            'emissiveColor',
            Color3.White(),
            1000
        )
        this.intersectionAction = new ExecuteCodeAction(
            {
                trigger: ActionManager.NothingTrigger,
                parameter: { mesh: this.targetMesh, usePreciseIntersection: true },
            },
            () => {
                this.synth.triggerAttackRelease(
                    randomFromArray(['C3', 'C4', 'C5', 'E3', 'E4', 'E5', 'G3', 'G4', 'G5']),
                    '4n'
                )
                this._particleSystemSetup(scene)
                this.blink()
            }
        )
        this.mesh.actionManager = new ActionManager(scene)
        this.mesh.actionManager.registerAction(this.colorAction)
        this.mesh.actionManager.registerAction(this.intersectionAction)
        return this
    }

    private _animationSetup = () => {
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
                frame: 15,
                value: this.scaling,
            },
        ]
        this.blinkAnimation.setKeys(blinkKeys)
        this.mesh.animations.push(this.blinkAnimation)
        return this
    }

    private _particleSystemSetup = (scene) => {
        const capacity = 30
        this.particleSystem = new ParticleSystem(this.name, capacity, scene)
        this.particleSystem.emitter = this.mesh
        // texture
        this.particleSystem.particleTexture = new Texture(
            'https://www.babylonjs.com/assets/Flare.png',
            scene
        )
        // color
        this.particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0)
        this.particleSystem.color2 = new Color4(0.2, 0.5, 1.0, 1.0)
        this.particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0)
        // size
        this.particleSystem.minSize = 0.1
        this.particleSystem.maxSize = 0.5
        // lifetime
        this.particleSystem.minLifeTime = 0.3
        this.particleSystem.maxLifeTime = 1
        // emission power
        this.particleSystem.minEmitPower = 1.5
        this.particleSystem.maxEmitPower = 3.0
        // direction
        this.particleSystem.direction1 = new Vector3(-1, -1, -1)
        this.particleSystem.direction2 = new Vector3(1, 1, 1)
        // gravity
        this.particleSystem.gravity = new Vector3(0, 0, 0)
        // emission rate
        this.particleSystem.manualEmitCount = capacity
        this.particleSystem.start()
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

    rise = () => {
        this.scene.beginDirectAnimation(
            this.mesh,
            [this.animation],
            0,
            300,
            false,
            1,
            this.executeColorAction
        )
    }

    blink = () => {
        this.scene.beginDirectAnimation(this.mesh, [this.blinkAnimation], 0, 30, false, 1)
    }

    executeColorAction = () => {
        this.colorAction.execute()
        this.scheduleTransport()
    }

    executeIntersectionAction = () => {
        this.intersectionAction.execute()
    }

    scheduleTransport = () => {
        const schedule = Transport.scheduleRepeat((time) => {
            this.executeIntersectionAction()
        }, '1n')
    }

    dispose = () => {}
}

export default Star
