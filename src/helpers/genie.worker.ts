import { PianoGenie } from './PianoGenie'
import { io } from '@tensorflow/tfjs'
import weights from './weights'

// eslint-disable-next-line no-restricted-globals
const ctx: Worker = self as any

const genie = new PianoGenie('/') // loading weights manually

ctx.onmessage = async ({ data }) => {
    console.log(`Worker received ${data}`)
    if (data === 'init') {
        const vars = await io.loadWeights(weights as any, '/')
        await genie.initialize(vars as any)
        genie.resetState()
        ctx.postMessage('Genie is ready')
    }
    if (genie.isInitialized()) {
        const note = genie.next(data, 0.25) // always outputs the same note, for some reason
        ctx.postMessage(note)
    }
}
