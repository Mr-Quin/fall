/**
 * Where all bodies belongs
 */

import Constellation from './Constellation'
import { context, Transport } from 'tone'

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
            if (!this.keys || !this.keys.length) return
            if (index > 7) index = 0
            console.log(index)
            this._constellations.forEach((constellation) => {
                if (!constellation.ready) return
                const asterism = constellation.asterisms[index]
                if (asterism.hasStars) {
                    asterism.blink(constellation.instrument, this.keys, context.currentTime)
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
