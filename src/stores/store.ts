import create from 'zustand'
import { AbstractMesh, Camera, Color4, Nullable, Scene, Vector3 } from '@babylonjs/core'
import { getValidNote, randomRange } from '../utils/utils'
import { fromMidi } from '@tonaljs/note'
import { Player } from 'soundfont-player'
import { constants, colors } from '../config/scene-config'
import { PianoGenie } from '../helpers/PianoGenie'
import StepDatabase, { Step } from '../helpers/StepDatabase'

type StoreState = {
    sceneReady: boolean
    animationFinished: boolean
    fallen: boolean
    db: StepDatabase
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
        appendDb: (data: Step) => void
        fall: () => void
        playTone: (position: Vector3) => void
        randomizeColor: () => void
    }
}

const date = new Date()
const { LOWEST_INSTRUMENT_MIDI_NUMBER, LOWEST_PIANO_MIDI_NUMBER, GENIE_TEMPERATURE } = constants

const useStore = create<StoreState>((set, get) => ({
    sceneReady: false,
    animationFinished: false,
    fallen: false,
    db: new StepDatabase(),
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
        fall: () => void 0,
        appendDb: (data) => {
            const db = get().db
            db.transaction('rw', db.steps, async () => {
                await db.steps.add(data)
            })
        },
        playTone: (position) => {
            const genie = get().mutations.genie
            const player = get().mutations.player
            if (genie === null || player === null) return

            const rand = randomRange(0, 8, true)
            const note = genie.next(rand, GENIE_TEMPERATURE) + LOWEST_PIANO_MIDI_NUMBER
            const validNote = getValidNote(note, LOWEST_INSTRUMENT_MIDI_NUMBER)

            player.play(fromMidi(validNote))

            get().actions.appendDb({ position: position, note: validNote, time: date.getTime() })
            get().actions.randomizeColor()
        },
        randomizeColor: () => {
            set(
                ({ mutations }) =>
                    void (mutations.colorTarget = new Color4(
                        randomRange(0, 0.07),
                        randomRange(0, 0.03),
                        randomRange(0, 0.07),
                        1
                    )) as any
            )
        },
    },
}))

export default useStore
