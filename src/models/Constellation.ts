/**
 * Star is a collection of stars
 */

import Star from './Star'
import {
    Color3,
    Color4,
    ParticleSystem,
    PBRMetallicRoughnessMaterial,
    Texture,
    Vector3,
} from '@babylonjs/core'

interface Constellation {
    stars: Star[]
    lines: any[]
    addStar(position: Vector3, diameter: number): void
}

class Constellation implements Constellation {
    private readonly _scene

    constructor(scene) {
        this._scene = scene
        this.stars = []
        this.lines = []
    }

    private _createStarParticle = (diameter) => {
        const capacity = 30
        const particleSystem = new ParticleSystem('starParticle', capacity, this._scene)
        // use mesh emitter
        particleSystem.createSphereEmitter(diameter)
        // texture
        particleSystem.particleTexture = new Texture(
            'https://www.babylonjs.com/assets/Flare.png',
            this._scene
        )
        // color
        particleSystem.color1 = new Color4(0.7, 0.8, 1.0, 1.0)
        particleSystem.color2 = new Color4(1, 0.8, 1.0, 1.0)
        particleSystem.colorDead = new Color4(0, 0, 0.2, 0.0)
        // size
        particleSystem.minSize = 0.1
        particleSystem.maxSize = 0.5
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
        particleSystem.emitRate = 30
        // stop after
        particleSystem.targetStopDuration = 0.3
        return particleSystem
    }

    private _createStarMaterial = () => {
        const material = new PBRMetallicRoughnessMaterial('material', this._scene)
        material.emissiveColor = new Color3(0.2, 0.2, 0)
        material.baseColor = Color3.White()
        material.roughness = 1
        return material
    }

    addStar = (position: Vector3, diameter: number): void => {
        const star = new Star(position, diameter, this._scene)
        star.setMaterial(this._createStarMaterial())
            .setParticleSystem(this._createStarParticle(diameter))
            .setAction(this._scene)
            .setAnimation()
        this.stars.push(star)
    }
}

export default Constellation
