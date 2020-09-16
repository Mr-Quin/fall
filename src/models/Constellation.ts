/**
 * Constellation has one or more asterisms
 */

import { Color3 } from '@babylonjs/core'
import { context } from 'tone'
import Soundfont, { Player } from 'soundfont-player'
import { Chords } from './Types'
import Asterism from './Asterism'
import Helper from './Helper'
import { v4 as uuidv4 } from 'uuid'

interface Constellation {
    name: string
    chords: Chords
    instrument: Player
}

class Constellation implements Constellation {
    private readonly _scene
    private readonly _asterisms: Asterism[]

    constructor(chords, scene) {
        this.name = uuidv4()
        this._scene = scene
        this._asterisms = []
        this.chords = chords
        this._generateAsterisms()
        this._loadInstrument()
    }

    get asterisms(): Asterism[] {
        return this._asterisms
    }

    private _generateAsterisms = () => {
        this.chords.forEach((chord) => {
            console.log('Generating asterisms', chord)
            const asterism = new Asterism(chord, this._scene)
            asterism.material = Helper.createEmissiveMaterial(
                new Color3(0.2, 0.2, 0.2),
                this._scene
            )
            asterism.generateStars()
            this._asterisms.push(asterism)
        })
    }

    private _loadInstrument = () => {
        Soundfont.instrument(context.rawContext as AudioContext, 'acoustic_grand_piano').then(
            (instrument) => {
                this.instrument = instrument
                console.log('Finished loading instrument')
            }
        )
    }
}

export default Constellation
