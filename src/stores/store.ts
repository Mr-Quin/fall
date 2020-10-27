import create from 'zustand'
import * as BABYLON from '@babylonjs/core'
import { Nullable } from '@babylonjs/core'

type StoreState = {
    statics: {
        scene: Nullable<BABYLON.Scene>
        canvas: Nullable<HTMLCanvasElement>
        camera: Nullable<BABYLON.Camera>
    }
    mutations: {
        ready: boolean
    }
    actions: {
        init: (
            scene: Nullable<BABYLON.Scene>,
            canvas: Nullable<HTMLCanvasElement>,
            camera: Nullable<BABYLON.Camera>
        ) => void
        setReady: () => void
        fall: () => void
    }
}

const useStore = create<StoreState>((set, get) => ({
    statics: {
        scene: null,
        canvas: null,
        camera: null,
    },
    mutations: {
        ready: false,
    },
    actions: {
        init: (scene, canvas, camera) => {
            set((state) => ({ statics: { scene: scene, canvas: canvas, camera: camera } }))
        },
        setReady: () => void (get().mutations.ready = true),
        fall: () => {},
    },
}))

export default useStore
