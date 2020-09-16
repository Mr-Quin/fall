/**
 * Asterism has one or more stars
 */

import Star from './Star'
import { Color3, Nullable, PBRMetallicRoughnessMaterial, Scene, Vector3 } from '@babylonjs/core'
import starList from './stars.json'
import { randomFromArray } from '../utils/utils'
import { Chord } from './Types'
import Helper from './Helper'
import { v4 as uuidv4 } from 'uuid'

interface Asterism {
    name: string
    stars: Star[]
    hasStars: boolean
    chord: Chord
}

class Asterism implements Asterism {
    private readonly _scene: Scene
    private _material: Nullable<PBRMetallicRoughnessMaterial>

    constructor(chord, scene) {
        this.name = uuidv4()
        this._scene = scene
        this._material = null
        this.chord = chord
        this.stars = []
    }

    set material(material: PBRMetallicRoughnessMaterial) {
        this._material = material
    }

    generateStars = () => {
        if (!this.chord.length) {
            this.hasStars = false
        }
        this.hasStars = true
        this.chord.forEach((octave) => {
            console.log('Generating stars', octave, this._material)
            const randomStar = randomFromArray(starList)
            const dia = 0.5
            const from = Vector3.Zero()
            const to = new Vector3(randomStar.x, randomStar.z, randomStar.y)

            const star = new Star(from, to, dia, Color3.White(), octave, this._scene)
            star.attachMaterial(this._material as PBRMetallicRoughnessMaterial)
                .attachParticleSystem(Helper.createBlinkParticleSystem(20, dia, this._scene))
                .attachRiseAnimation(Helper.createRiseAnimation(from, to))
                .attachBlinkAnimation(
                    Helper.createBlinkAnimation(new Vector3(1, 1, 1), new Vector3(1.5, 1.5, 1.5))
                )
            this.stars.push(star)
        })
    }

    blink = () => {
        this.stars.forEach((star) => {
            star.blink()
        })
    }
}

export default Asterism
