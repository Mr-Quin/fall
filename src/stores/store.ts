import create from 'zustand'
import { AbstractMesh, Camera, Color4, Nullable, Scene } from '@babylonjs/core'
import { getValidNote, randomRange } from '../utils/utils'
import { fromMidi } from '@tonaljs/note'
import { Player } from 'soundfont-player'
import { constants, colors } from '../config/scene-config'
import { PianoGenie } from '@magenta/music'

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
        genie: Nullable<PianoGenie>
        player: Nullable<Player>
    }
    actions: {
        initScene: (
            scene: Nullable<Scene>,
            canvas: Nullable<HTMLCanvasElement>,
            camera: Nullable<Camera>
        ) => void
        fall: Nullable<() => void>
        playTone: () => void
        randomizeColor: () => void
    }
}

const { LOWEST_INSTRUMENT_MIDI_NUMBER, LOWEST_PIANO_MIDI_NUMBER, GENIE_TEMPERATURE } = constants

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
        genie: null,
        player: null,
    },
    actions: {
        initScene: (scene, canvas, camera) => {
            set((state) => ({ statics: { scene: scene, canvas: canvas, camera: camera } }))
        },
        fall: null,
        playTone: () => {
            const genie = get().mutations.genie
            const player = get().mutations.player
            if (genie === null || player === null) return
            const note =
                genie.next(randomRange(1, 9, true), GENIE_TEMPERATURE) + LOWEST_PIANO_MIDI_NUMBER
            const validNote = getValidNote(note, LOWEST_INSTRUMENT_MIDI_NUMBER)

            player.play(fromMidi(validNote))
            get().actions.randomizeColor()
        },
        randomizeColor: () => {
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
