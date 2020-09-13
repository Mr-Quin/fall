import React from 'react'
import styled from 'styled-components'
import {
    Vector3,
    Color3,
    Mesh,
    HemisphericLight,
    MeshBuilder,
    ArcRotateCamera,
    ActionManager,
    InterpolateValueAction,
    DoNothingAction,
    GlowLayer,
    StandardMaterial,
    Space,
    Axis,
    Matrix,
} from '@babylonjs/core'
import SceneComponent from './SceneComponent'
import Constellation from '../models/Constellation'

const StyledScene = styled(SceneComponent)`
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
`

let startingLocation: Vector3 | null = null
let plan1

const onSceneReady = (scene) => {
    const canvas = scene.getEngine().getRenderingCanvas()
    /**
     * Camera setup
     */
    const camera = new ArcRotateCamera('Camera', 0, 0, 5, new Vector3(0, 0, 0), scene)
    camera.setPosition(new Vector3(5, 10, 20))
    camera.setTarget(Vector3.Zero())
    camera.attachControl(canvas, true)
    camera.lowerRadiusLimit = 5

    scene.clearColor = Color3.Black()

    // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene)
    light.intensity = 0.5

    // Our built-in 'ground' shape.
    const ground = MeshBuilder.CreateGround('ground', { width: 6, height: 6 }, scene)
    ground.actionManager = new ActionManager(scene)
    ground.actionManager.registerAction(new DoNothingAction(ActionManager.OnPickTrigger))

    const glow = new GlowLayer('glow', scene, { mainTextureSamples: 2 })

    const matPlan = new StandardMaterial('matPlan1', scene)
    matPlan.backFaceCulling = false
    matPlan.diffuseColor = new Color3(0.2, 1, 0.2)
    matPlan.wireframe = true
    plan1 = Mesh.CreatePlane('plane1', 40, scene)
    plan1.position = new Vector3(20, -20, 0)
    plan1.rotation.x = Math.PI
    plan1.material = matPlan
    const pivotTranslate = plan1.position.subtract(Vector3.Zero())
    plan1.setPivotMatrix(Matrix.Translation(pivotTranslate.x, pivotTranslate.y, pivotTranslate.z))

    const constellation = new Constellation(scene)

    const getGroundPosition = () => {
        // Use a predicate to get position on the ground
        const pickInfo = scene.pick(scene.pointerX, scene.pointerY, function (mesh) {
            return mesh === ground
        })
        if (pickInfo.hit) {
            return pickInfo.pickedPoint
        }
        return null
    }

    const onPointerDown = (e) => {
        console.log('Pointer Down')
        if (e.button !== 0) return

        // check if we are under a mesh
        const pickInfo = scene.pick(scene.pointerX, scene.pointerY, (mesh) => {
            return mesh === ground
        })
        if (pickInfo.hit) {
            startingLocation = getGroundPosition()

            if (startingLocation) {
                constellation.addStar(startingLocation, Math.random(), plan1)
                camera.detachControl(canvas)
            }
        }
    }

    const onPointerUp = (e) => {
        console.log('Pointer Up')
        if (startingLocation) {
            camera.attachControl(canvas, true)
            startingLocation = null
        }
    }

    canvas.addEventListener('pointerdown', onPointerDown, false)
    canvas.addEventListener('pointerup', onPointerUp, false)

    scene.onDispose = function () {
        canvas.removeEventListener('pointerdown', onPointerDown)
        canvas.removeEventListener('pointerup', onPointerUp)
    }
}

const onRender = (scene) => {
    const deltaTimeInMillis = scene.getEngine().getDeltaTime()

    const rpm = 10
    const rate = (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000)
    plan1.rotate(Axis.Y, rate, Space.LOCAL)
}

const SceneViewer = () => (
    <StyledScene
        antialias
        // onPointerDown={onPointerDown}
        onSceneReady={onSceneReady}
        onRender={onRender}
        id="my-canvas"
    />
)

export default SceneViewer
