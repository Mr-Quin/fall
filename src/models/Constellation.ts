/**
 * Star is a collection of stars
 */

import Star from './Star'
import stars from './stars.json'
import {
    Color3,
    Color4,
    ParticleSystem,
    PBRMetallicRoughnessMaterial,
    Texture,
    Vector3,
} from '@babylonjs/core'
import { randomFromArray } from '../utils/utils'

interface Constellation {
    stars: any[]
    lines: any[]
    addStar(position: Vector3, diameter: number, octave: number): void
}

class Constellation implements Constellation {
    private readonly _scene
    private readonly con: any

    constructor(scene) {
        this._scene = scene
        this.con = stars
        this.stars = []
        this.lines = []
        // this.con.forEach((star) => {
        //     const pos = new Vector3(star.x, star.z, star.y).normalize().scale(40)
        //     const color = kToRGB(bvToK(star.ci))
        //     new Star(Vector3.Zero(), pos, 0.5, Color3.White(), this._scene)
        //         .setMaterial(this._createStarMaterial())
        //         .setParticleSystem(this._createStarParticle(0.5))
        //         .setAction(this._scene)
        //         .setAnimation()
        // })
    }

    private _createStarParticle = (diameter) => {
        const capacity = 20
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

    private _createStarMaterial = () => {
        const material = new PBRMetallicRoughnessMaterial('material', this._scene)
        material.emissiveColor = new Color3(0.2, 0.2, 0.2)
        material.baseColor = Color3.White()
        material.roughness = 1
        return material
    }

    addStar = (position: Vector3, diameter: number, octave: number): void => {
        const s = randomFromArray(this.con)
        const starPos = new Vector3(s.x, s.z, s.y)
        const star = new Star(position, starPos, diameter, Color3.White(), octave, this._scene)
        star.setMaterial(this._createStarMaterial())
            .setParticleSystem(this._createStarParticle(diameter))
            .setAction(this._scene)
            .setAnimation()
        if (this.stars.length) {
            const last = this.stars[this.stars.length - 1]
            if (last.length > 3) {
                this.stars.push([star])
            } else {
                if (Math.random() < 0.5) {
                    this.stars.push([star])
                } else {
                    this.stars[this.stars.length - 1].push(star)
                }
            }
        } else {
            this.stars.push([star])
        }
        console.log(this.stars)
    }
}

export default Constellation
