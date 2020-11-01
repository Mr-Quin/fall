import { useEffect } from 'react'
import { Engine } from '@babylonjs/core'
import { instrument } from 'soundfont-player'
import useStore from '../stores/store'
import celesta from '../config/celesta'
import { PianoGenie } from '@magenta/music'

const initGenie = async () => {
    const genie = new PianoGenie('/genie')
    await genie.initialize()
    genie.resetState()
    return genie
}

const initPlayer = async () => {
    return await instrument(
        Engine.audioEngine.audioContext as AudioContext,
        'celesta',
        { gain: 2, nameToUrl: () => celesta } // use local audio data
    )
}

const asyncOps = async () => {
    const player = await initPlayer()
    useStore.setState((state) => (state.mutations.player = player as any))
    const genie = await initGenie()
    useStore.setState((state) => (state.mutations.genie = genie as any))
}

const Genie = () => {
    useEffect(() => {
        asyncOps().then(() => {
            console.log('genie loaded')
        })
    }, [])

    return null
}

export default Genie
