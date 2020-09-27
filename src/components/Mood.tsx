import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { Progression, Chord, Note } from '@tonaljs/tonal'
import { context, Transport } from 'tone'

interface Mood {
    bpm: number
    keys: Array<string>
    chordName: string
    setBpm: Function
    toggleTransport: Function
}

const MoodContext = createContext<Partial<Mood>>({})

const MoodProvider: React.FunctionComponent<any> = ({ ...props }) => {
    const [chord, setChord] = useState<any>({})

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
    const chords = Progression.fromRomanNumerals('F', [
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
        let i = 0
        Transport.scheduleRepeat((time) => {
            setChord(Chord.get(chords[i]))
            i += 1
            if (i >= chords.length) i = 0
        }, '1n')
        Transport.start()
        Transport.bpm.value = 90

        return () => {
            Transport.stop()
        }
    }, [])

    const value = {
        bpm: Transport.bpm.value,
        keys: chord.notes,
        chordName: chord.name,
    }

    return <MoodContext.Provider value={value}>{props.children}</MoodContext.Provider>
}

const useMood = () => {
    const context = useContext(MoodContext)
    if (context === undefined) throw new Error('Must be used within MoonContext')
    return context
}

export { MoodContext, useMood, MoodProvider }
