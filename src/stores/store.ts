import create from 'zustand'
import { Camera, Color4, Engine, Nullable, Scene } from '@babylonjs/core'
import { randomRange } from '../utils/utils'
import { fromMidi } from '@tonaljs/note'
import { instrument, Player } from 'soundfont-player'
import { constants, colors } from '../config/scene-config'
import StepDatabase, { Step } from '../helpers/StepDatabase'
import celesta from '../helpers/celesta'

// eslint-disable-next-line import/no-webpack-loader-syntax
import Worker from 'worker-loader!../helpers/genie.worker'

const initGenie = async () => {
    const genieWorker = new Worker()

    genieWorker.postMessage('init')

    return genieWorker
}

const initPlayer = async () => {
    return await instrument(
        Engine.audioEngine.audioContext as AudioContext,
        'celesta',
        { gain: 2, nameToUrl: () => celesta } // use local audio data
    )
}

type StoreState = {
    sceneReady: boolean
    titleAnimationFinished: boolean
    fallen: boolean
    db: StepDatabase
    statics: {
        scene: Nullable<Scene>
        canvas: Nullable<HTMLCanvasElement>
        camera: Nullable<Camera>
    }
    mutations: {
        end: boolean
        bounces: number
        colorTarget: Color4
        genieWorker: Nullable<Worker>
        player: Nullable<Player>
        lastNote: Array<number>
    }
    actions: {
        initScene: (
            scene: Nullable<Scene>,
            canvas: Nullable<HTMLCanvasElement>,
            camera: Nullable<Camera>
        ) => void
        appendDb: (data: Step) => void
        fall: () => void
        playTone: () => any
        endJourney: () => void
        randomizeColor: () => void
    }
}

const { A5_MIDI_NUMBER, A3_MIDI_NUMBER } = constants

const useStore = create<StoreState>((set, get) => ({
    sceneReady: false,
    titleAnimationFinished: false,
    fallen: false,
    db: new StepDatabase(),
    statics: {
        scene: null,
        canvas: null,
        camera: null,
    },
    mutations: {
        end: false,
        bounces: 0,
        colorTarget: Color4.FromHexString(colors.BACKGROUND_COLOR),
        genieWorker: null,
        player: null,
        lastNote: [],
    },
    actions: {
        initScene: async (scene, canvas, camera) => {
            const player = await initPlayer()
            const genieWorker = await initGenie()
            const stepsCount = await get().db.steps.count()

            // play sound on message
            genieWorker.onmessage = ({ data }) => {
                if (typeof data !== 'number') return
                player.play(fromMidi(data))
                get().mutations.lastNote.push(data)
            }

            set({ statics: { scene, canvas, camera } })
            set(({ mutations }) => void (mutations.player = player) as any)
            set(({ mutations }) => void (mutations.genieWorker = genieWorker) as any)
            set(({ mutations }) => void (mutations.bounces = stepsCount) as any)
        },
        fall: () => {},
        appendDb: (data) => {
            const db = get().db
            db.transaction('rw', db.steps, async () => {
                await db.steps.add(data)
            })
        },
        playTone: () => {
            const genieWorker = get().mutations.genieWorker
            if (genieWorker === null) return

            set(({ mutations }) => void (mutations.lastNote = []) as any)

            genieWorker.postMessage({ button: randomRange(0, 8, true), baseNote: A5_MIDI_NUMBER })
            genieWorker.postMessage({ button: randomRange(0, 8, true), baseNote: A3_MIDI_NUMBER })

            console.debug(
                `bounce ${get().mutations.bounces + 1}, played note ${fromMidi(
                    get().mutations.lastNote[0]
                )} ${fromMidi(get().mutations.lastNote[1])}`
            )

            return get().mutations.lastNote
        },
        endJourney: () => {},
        randomizeColor: () => {
            set(
                ({ mutations }) =>
                    void (mutations.colorTarget = new Color4(
                        randomRange(0, 0.1),
                        randomRange(0, 0.05),
                        randomRange(0, 0.15),
                        1
                    )) as any
            )
        },
    },
}))

export default useStore
