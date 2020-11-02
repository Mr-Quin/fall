import { useEffect } from 'react'
import { Engine } from '@babylonjs/core'
import { instrument } from 'soundfont-player'
import useStore from '../stores/store'
import celesta from '../helpers/celesta'
import { PianoGenie } from '../helpers/PianoGenie'
import { io } from '@tensorflow/tfjs/'
import weights from '../helpers/weights_manifest.json'

const initGenie = async () => {
    const genie = new PianoGenie('/') // loading weights manually
    const vars = await io.loadWeights(weights as any, '/genie')

    await genie.initialize(vars as any)
    genie.resetState()
    return genie
}

const initPlayer = async () => {
    console.log('loading instrument')
    return await instrument(
        Engine.audioEngine.audioContext as AudioContext,
        'celesta',
        { gain: 2, nameToUrl: () => celesta } // use local audio data
    )
}

const initAudio = async () => {
    const player = await initPlayer()
    useStore.setState((state) => (state.mutations.player = player as any))
    const genie = await initGenie()
    useStore.setState((state) => (state.mutations.genie = genie as any))
}

const Genie = () => {
    useEffect(() => {
        initAudio()
    }, [])

    return null
}

export default Genie
