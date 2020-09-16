import {
    Animation,
    Color3,
    Color4,
    EasingFunction,
    ParticleSystem,
    PBRMetallicRoughnessMaterial,
    Scene,
    SineEase,
    Texture,
    Vector3,
} from '@babylonjs/core'

/**
 * Provides static methods to create animations and actions
 */

class Helper {
    static createEmissiveMaterial = (color: Color3, scene: Scene): PBRMetallicRoughnessMaterial => {
        const material = new PBRMetallicRoughnessMaterial('material', scene)
        material.emissiveColor = color
        material.baseColor = Color3.White()
        material.roughness = 1
        return material
    }

    static createStandardMaterial = () => {}

    static createRiseAnimation = (from: Vector3, to: Vector3): Animation => {
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
    }

    static createBlinkAnimation = (origScale: Vector3, blinkScale: Vector3): Animation => {
        const animation = new Animation(
            'blinkAnimation',
            'scaling',
            30,
            Animation.ANIMATIONTYPE_VECTOR3,
            Animation.ANIMATIONLOOPMODE_CYCLE
        )
        const blinkKeys = [
            {
                frame: 0,
                value: origScale,
            },
            {
                frame: 5,
                value: new Vector3(1.5, 1.5, 1.5),
            },
            {
                frame: 10,
                value: blinkScale,
            },
        ]
        animation.setKeys(blinkKeys)

        return animation
    }

    static createBlinkParticleSystem = (
        capacity: number,
        diameter: number,
        scene: Scene
    ): ParticleSystem => {
        const particleSystem = new ParticleSystem('starParticle', capacity, scene)
        // use mesh emitter
        particleSystem.createSphereEmitter(diameter)
        // texture
        particleSystem.particleTexture = new Texture(
            'https://www.babylonjs.com/assets/Flare.png',
            scene
        )
        // color
        particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0)
        particleSystem.color2 = new Color4(1, 0.8, 1.0, 1.0)
        particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0)
        // size
        particleSystem.minSize = 0.1
        particleSystem.maxSize = 0.4
        // lifetime
        particleSystem.minLifeTime = 0.3
        particleSystem.maxLifeTime = 1
        // emission power
        particleSystem.minEmitPower = 2.5
        particleSystem.maxEmitPower = 4.0
        // direction
        particleSystem.direction1 = new Vector3(-1, -1, -1)
        particleSystem.direction2 = new Vector3(1, 1, 1)
        // gravity
        particleSystem.gravity = new Vector3(0, 0, 0)
        // emission rate
        particleSystem.emitRate = 20
        // stop after
        particleSystem.targetStopDuration = 0.2
        return particleSystem
    }
}

export default Helper
