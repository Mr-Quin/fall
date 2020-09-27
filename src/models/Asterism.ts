/**
 * Asterism has one or more stars
 */

import Star from './Star'
import {
    Color3,
    Nullable,
    PBRMetallicRoughnessMaterial,
    Scene,
    Vector3,
    Mesh,
} from '@babylonjs/core'
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
    private _starList: any

    constructor(chord, con, scene) {
        this.name = uuidv4()
        this._scene = scene
        this._starList = con
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
        const promises: any[] = [] //TODO: find better way to resolve the promise
        this.hasStars = true
        for (const octave of this.chord) {
            console.log('Generating stars', octave, this._material)
            const randomStar = randomFromArray(this._starList)
            const dia = 0.5
            const from = Vector3.Zero()
            const to = new Vector3(randomStar.x, randomStar.z, randomStar.y)
            let resolve
            const promise = new Promise((res, rej) => {
                resolve = res
            })
            promises.push(promise)

            const star = new Star(from, to, dia, Color3.White(), octave, this._scene, (value) => {
                resolve(value)
            })
            star.attachMaterial(this._material as PBRMetallicRoughnessMaterial)
                .attachParticleSystem(Helper.createBlinkParticleSystem(20, dia, this._scene))
                .attachRiseAnimation(Helper.createRiseAnimation(from, to))
                .attachBlinkAnimation(
                    Helper.createBlinkAnimation(new Vector3(1, 1, 1), new Vector3(1.5, 1.5, 1.5))
                )
            this.stars.push(star)
        }
        Promise.all(promises).then((values) => {
            this.generateLines(values)
        })
        return promises
    }

    generateLines = (positions) => {
        Mesh.CreateLines('concentric', positions, this._scene, true)
    }

    blink = (instrument, keys, currentTime, duration = 1) => {
        let usedKeys: any[] = []
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i]
            let key = randomFromArray(keys)
            if (!usedKeys.length === keys.length) {
                if (usedKeys.includes(key)) key = randomFromArray(keys)
            }
            usedKeys.push(key)
            instrument.play(`${key}${star.octave}`).stop(currentTime + duration)
            star.blink()
        }
    }
}

export default Asterism
