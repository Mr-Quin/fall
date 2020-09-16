/**
 * Where all bodies belongs
 */

import Constellation from './Constellation'
import { context, Transport } from 'tone'
import { randomFromArray } from '../utils/utils'

interface Space {
    keys: string[]
}

class Space implements Space {
    private readonly _scene: any
    private readonly _constellations: Constellation[]

    constructor(scene) {
        this._scene = scene
        this._constellations = []
        this.keys = []
    }

    get constellations(): Constellation[] {
        return this._constellations
    }

    startTransport = () => {
        let index = 0
        Transport.scheduleRepeat(() => {
            console.log(this.keys)
            if (!this.keys.length) return
            if (index > 7) index = 0
            this._constellations.forEach((constellation) => {
                const asterism = constellation.asterisms[index]
                if (asterism.hasStars) {
                    asterism.stars.forEach((star) => {
                        const key = `${randomFromArray(this.keys)}${star.octave}`
                        console.log(key)
                        star.blink()
                        constellation.instrument.play(key).stop(context.currentTime + 1)
                    })
                }
            })
            index += 1
        }, '8n')
    }

    addConstellation = (chords) => {
        console.log('Adding Constellations', chords)
        this._constellations.push(new Constellation(chords, this._scene))
    }
}

export default Space
