import create from 'zustand'
import * as BABYLON from '@babylonjs/core'
import { Nullable } from '@babylonjs/core'

type StoreState = {
    sceneReady: boolean
    animationFinished: boolean
    fallen: boolean
    statics: {
        scene: Nullable<BABYLON.Scene>
        canvas: Nullable<HTMLCanvasElement>
        camera: Nullable<BABYLON.Camera>
    }
    mutations: {}
    actions: {
        init: (
            scene: Nullable<BABYLON.Scene>,
            canvas: Nullable<HTMLCanvasElement>,
            camera: Nullable<BABYLON.Camera>
        ) => void
        fall: () => void
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
    mutations: {},
    actions: {
        init: (scene, canvas, camera) => {
            set((state) => ({ statics: { scene: scene, canvas: canvas, camera: camera } }))
        },
        fall: () => void 0,
    },
}))

export default useStore
