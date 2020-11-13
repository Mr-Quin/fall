import { PianoGenie } from './PianoGenie'
import { io } from '@tensorflow/tfjs'
import weights from './weights'
import { constants } from '../config/scene-config'
import { getValidNote } from '../utils/utils'

// eslint-disable-next-line no-restricted-globals
const ctx: Worker = self as any

const { GENIE_TEMPERATURE, A0_MIDI_NUMBER } = constants
const genie = new PianoGenie('/') // loading weights manually

if (process.env.NODE_ENV !== 'development') {
    console.debug = () => {}
}

ctx.onmessage = async ({ data }) => {
    console.debug(`Worker received ${JSON.stringify(data)}`)
    if (!genie.isInitialized()) {
        const vars = await io.loadWeights(weights as any, '/')
        await genie.initialize(vars as any)
        console.debug('Genie is initialized')
    } else {
        const { button, baseNote } = data
        const note = genie.next(button, GENIE_TEMPERATURE)
        const validNote = getValidNote(note + A0_MIDI_NUMBER, baseNote)
        ctx.postMessage(validNote)
    }
}
