import create from 'zustand'
import { Nullable } from '@babylonjs/core'
import { Player } from 'soundfont-player'
import { Chord } from '@tonaljs/chord'
import { randomFromArray, randomRange } from '../utils/utils'

type StoreState = {
    progression: Nullable<string[]>
    chord: Nullable<Chord>
    bpm: Nullable<number>
    player: Nullable<Player>
    play: () => void
}

const useMoodStore = create<StoreState>((set, get) => ({
    progression: null,
    chord: null,
    bpm: null,
    player: null,
    play: () => {
        const notes = get().chord!.notes
        const note = randomFromArray(notes)
        const octave = randomRange(6, 7) << 0
        get().player!.play(`${note}${octave}`)
    },
}))

export default useMoodStore
