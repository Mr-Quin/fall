/**
 * Star is a BabylonJS sphere mesh with material and animation
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
} from '@babylonjs/core'
import { v4 as uuidv4 } from 'uuid'
import { FMSynth } from 'tone'
import { randomFromArray } from '../utils/utils'

interface Star {
    name: string
    scene: any
    mesh: Mesh
    material: PBRMetallicRoughnessMaterial
    animation: Animation
    action: Action
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
        setTimeout(this.animate, 300)
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
        this.action = new InterpolateValueAction(
            ActionManager.NothingTrigger,
            this.material,
            'emissiveColor',
            Color3.White(),
            1000
        )
        const intersectAction = new ExecuteCodeAction(
            {
                trigger: ActionManager.OnIntersectionEnterTrigger,
                parameter: { mesh: this.targetMesh, usePreciseIntersection: true },
            },
            () => {
                this.synth.triggerAttackRelease(
                    randomFromArray(['C3', 'C4', 'C5', 'E3', 'E4', 'E5', 'G3', 'G4', 'G5']),
                    '4n'
                )
            }
        )
        this.mesh.actionManager = new ActionManager(scene)
        this.mesh.actionManager.registerAction(this.action)
        this.mesh.actionManager.registerAction(intersectAction)
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
        const keys: any[] = [
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

        this.animation.setKeys(keys)
        this.mesh.animations.push(this.animation)
        return this
    }

    get position(): Vector3 {
        return this.mesh.position
    }

    get color(): Color3 {
        return this.material.emissiveColor
    }

    moveTo = (position: Vector3) => {}

    animate = () => {
        this.scene.beginDirectAnimation(
            this.mesh,
            [this.animation],
            0,
            300,
            false,
            1,
            this.executeAction
        )
    }

    executeAction = () => {
        this.action.execute()
    }
}

export default Star
