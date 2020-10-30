import create from 'zustand'
import { AbstractMesh, Camera, Color4, Nullable, Scene } from '@babylonjs/core'
import { randomFromArray, randomRange } from '../utils/utils'
import { Chord } from '@tonaljs/chord'
import { Player } from 'soundfont-player'
import { colors } from '../config/scene-config'

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
        bounces: number
        colorTarget: Color4
        chord: Nullable<Chord>
        player: Nullable<Player>
        previousNote: Nullable<string>
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
        bounces: 0,
        colorTarget: Color4.FromHexString(colors.backgroundColor),
        chord: null,
        player: null,
        previousNote: null,
    },
    actions: {
        init: async (scene, canvas, camera) => {
            set((state) => ({ statics: { scene: scene, canvas: canvas, camera: camera } }))
            return Promise.resolve()
        },
        fall: null,
        playTone: () => {
            const notes = get().mutations.chord!.notes
            const note = randomFromArray(notes, (note) => note !== get().mutations.previousNote)
            let octave = randomRange(6, 7, true)
            if (note === 'A' || note === 'B') octave -= 1
            const player = get().mutations.player
            player && player.play(`${note}${octave}`)
            set(({ mutations }) => void (mutations.previousNote = note) as any)
            set(
                ({ mutations }) =>
                    void (mutations.colorTarget = new Color4(
                        randomRange(0, 0.2),
                        randomRange(0, 0.2),
                        randomRange(0, 0.2),
                        1
                    )) as any
            )
        },
    },
}))

export default useStore
