import create from 'zustand'
import { AbstractMesh, Camera, Nullable, Scene } from '@babylonjs/core'
import { randomFromArray, randomRange } from '../utils/utils'
import { Chord } from '@tonaljs/chord'
import { Player } from 'soundfont-player'

type StoreState = {
    sceneReady: boolean
    animationFinished: boolean
    fallen: boolean
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
        ) => void
        fall: () => void
        playTone: () => void
    }
}

const useStore = create<StoreState>((set, get) => ({
    sceneReady: false,
    animationFinished: false,
    fallen: false,
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
        init: (scene, canvas, camera) => {
            set((state) => ({ statics: { scene: scene, canvas: canvas, camera: camera } }))
        },
        fall: () => void 0,
        playTone: () => {
            const notes = get().mutations.chord!.notes
            const note = randomFromArray(notes)
            const octave = randomRange(6, 8, true)
            const player = get().mutations.player
            player && player.play(`${note}${octave}`)
        },
    },
}))

export default useStore
