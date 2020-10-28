import { useEffect } from 'react'
import { Progression, Chord } from '@tonaljs/tonal'
import { Transport } from 'tone'
import { Engine } from '@babylonjs/core'
import { instrument } from 'soundfont-player'
import useStore from '../stores/store'

const Mood = (props) => {
    const progression = Progression.fromRomanNumerals('C', [
        // Canon
        'I',
        'V',
        'VIm',
        'IIIm',
        'IV',
        'I',
        'IV',
        'V',
    ])
    // const progression = Progression.fromRomanNumerals('C', [
    //     // Nier
    //     'IM7',
    //     'VIIm7',
    //     'VIm7',
    //     'VM7',
    //     'IVM7',
    //     'IIIm7',
    //     'IIIbM7',
    //     'II7',
    // ])
    // const progression = Progression.fromRomanNumerals('F', [
    //     // Final Fantasy
    //     'I',
    //     'V',
    //     'IV',
    //     'IIIm',
    //     'IV',
    //     'II',
    //     'Vsus4',
    //     'V',
    // ])

    useEffect(() => {
        async function setTonePlayer() {
            const player = await instrument(
                Engine.audioEngine.audioContext as AudioContext,
                'celesta',
                { gain: 2 }
            )
            useStore.setState((state) => (state.mutations.player = player as any))
        }
        setTonePlayer().then(() => {
            let i = 0

            Transport.scheduleRepeat(() => {
                const chord = Chord.get(progression[i])
                useStore.setState((state) => (state.mutations.chord = chord as any))
                i += 1
                if (i >= progression.length) i = 0
            }, '1n')

            Transport.start()
            Transport.bpm.value = 80
        })

        return () => void Transport.stop()
    }, [])

    return null
}

export default Mood
