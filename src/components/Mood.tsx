import { useEffect } from 'react'
import { Progression, Chord } from '@tonaljs/tonal'
import { Transport } from 'tone'
import useMoodStore from '../stores/moodStore'
import * as Soundfont from 'soundfont-player'
import * as BABYLON from '@babylonjs/core'

const Mood = (props) => {
    // const chords = Progression.fromRomanNumerals("C", ['Im', 'Vm', 'VIb', 'IIIb', 'IVm', 'Im', 'II', 'V']);
    // const chords = Progression.fromRomanNumerals('C', [  // Canon
    //     'I',
    //     'V',
    //     'VIm',
    //     'IIIm',
    //     'IV',
    //     'I',
    //     'IV',
    //     'V',
    // ])
    // const chords = Progression.fromRomanNumerals('C', [
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
    const progression = Progression.fromRomanNumerals('F', [
        // Final Fantasy
        'I',
        'V',
        'IV',
        'IIIm',
        'IV',
        'II',
        'Vsus4',
        'V',
    ])

    useEffect(() => {
        async function anon() {
            const player = await Soundfont.instrument(
                BABYLON.Engine.audioEngine.audioContext as AudioContext,
                'celesta',
                { gain: 2 }
            )
            useMoodStore.setState({ player })
        }
        anon().then(() => {
            let i = 0
            Transport.scheduleRepeat((time) => {
                const chord = Chord.get(progression[i])
                useMoodStore.setState({ chord })
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
