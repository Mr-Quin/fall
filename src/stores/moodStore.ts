import create from 'zustand'
import { Nullable } from '@babylonjs/core'
import { Player } from 'soundfont-player'
import { Chord } from '@tonaljs/chord'
import { randomFromArray, randomRange } from '../utils/utils'
import { Progression } from '@tonaljs/tonal'

type StoreState = {
    progression: Nullable<string[]>
    chord: Nullable<Chord>
    bpm: Nullable<number>
    player: Nullable<Player>
    play: () => void
}

const useMoodStore = create<StoreState>((set, get) => ({
    progression: Progression.fromRomanNumerals('F', [
        // Final Fantasy
        'I',
        'V',
        'IV',
        'IIIm',
        'IV',
        'II',
        'Vsus4',
        'V',
    ]),
    chord: null,
    bpm: null,
    player: null,
    play: () => {
        const notes = get().chord!.notes
        const note = randomFromArray(notes)
        const octave = randomRange(6, 8, true)
        const player = get().player
        player && player.play(`${note}${octave}`)
    },
}))

export default useMoodStore
