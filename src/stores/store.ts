import create from 'zustand'
import { AbstractMesh, Camera, Nullable, Scene } from '@babylonjs/core'
import { randomFromArray, randomRange } from '../utils/utils'
import { Chord } from '@tonaljs/chord'
import { Player } from 'soundfont-player'

type StoreState = {
    sceneReady: boolean
    animationFinished: boolean
    fallen: boolean
    defaults: {
        backgroundColor: string
    }
    statics: {
        scene: Nullable<Scene>
        canvas: Nullable<HTMLCanvasElement>
        camera: Nullable<Camera>
    }
    mutations: {
        steps: AbstractMesh[]
        chord: Nullable<Chord>
        player: Nullable<Player>
    }
    actions: {
        init: (
            scene: Nullable<Scene>,
            canvas: Nullable<HTMLCanvasElement>,
            camera: Nullable<Camera>
        ) => Promise<void>
        fall: Nullable<() => void>
        playTone: () => void
    }
}

const useStore = create<StoreState>((set, get) => ({
    sceneReady: false,
    animationFinished: false,
    fallen: false,
    defaults: {
        backgroundColor: '#0b061f',
    },
    statics: {
        scene: null,
        canvas: null,
        camera: null,
    },
    mutations: {
        steps: [],
        chord: null,
        player: null,
    },
    actions: {
        init: async (scene, canvas, camera) => {
            set((state) => ({ statics: { scene: scene, canvas: canvas, camera: camera } }))
            return Promise.resolve()
        },
        fall: null,
        playTone: () => {
            const notes = get().mutations.chord!.notes
            const note = randomFromArray(notes)
            let octave = randomRange(6, 7, true)
            if (note === 'A' || note === 'B') octave -= 1
            const player = get().mutations.player
            player && player.play(`${note}${octave}`)
        },
    },
}))

export default useStore
