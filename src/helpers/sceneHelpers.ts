import {
    AbstractMesh,
    Animation,
    Color3,
    CubicEase,
    EasingFunction,
    EngineInstrumentation,
    HemisphericLight,
    Mesh,
    PhysicsImpostor,
    PhysicsJoint,
    SceneInstrumentation,
    Vector3,
} from '@babylonjs/core'

const toggleOverlay = async (scene) => {
    await import('@babylonjs/inspector')
    await import('@babylonjs/core/Debug/debugLayer')
    const showing = scene.debugLayer.isVisible()
    await scene.debugLayer.show({ overlay: !showing })
}

const enableDebugMetrics = async (scene) => {
    const BABYLONGUI = await import('@babylonjs/gui')
    const advancedTexture = BABYLONGUI.AdvancedDynamicTexture.CreateFullscreenUI('UI')
    const stackPanel = new BABYLONGUI.StackPanel()
    stackPanel.verticalAlignment = BABYLONGUI.Control.VERTICAL_ALIGNMENT_TOP
    stackPanel.topInPixels = 30
    stackPanel.isVertical = true
    advancedTexture.addControl(stackPanel)
    const frameTime = new BABYLONGUI.TextBlock()
    const averageFrameTime = new BABYLONGUI.TextBlock()
    const shaderTime = new BABYLONGUI.TextBlock()
    const shaderCount = new BABYLONGUI.TextBlock()
    const physicsTime = new BABYLONGUI.TextBlock()
    const fps = new BABYLONGUI.TextBlock()

    const applyTextStyles = (textBlocks) =>
        void textBlocks.forEach((textBlock) => {
            textBlock.text = ''
            textBlock.color = 'white'
            textBlock.fontSize = 16
            textBlock.height = '30px'
            stackPanel.addControl(textBlock)
        })

    applyTextStyles([frameTime, averageFrameTime, shaderTime, shaderCount, physicsTime, fps])

    const engine = scene!.getEngine()
    const engineInstrumentation = new EngineInstrumentation(engine)
    const sceneInstrumentation = new SceneInstrumentation(scene)

    engineInstrumentation.captureGPUFrameTime = true
    engineInstrumentation.captureShaderCompilationTime = true
    sceneInstrumentation.capturePhysicsTime = true

    scene.registerBeforeRender(() => {
        frameTime.text = `Current frame time (GPU): ${(
            engineInstrumentation.gpuFrameTimeCounter.current * 0.000001
        ).toFixed(2)} ms`
        averageFrameTime.text = `Average frame time (GPU): ${(
            engineInstrumentation.gpuFrameTimeCounter.average * 0.000001
        ).toFixed(2)} ms`
        shaderTime.text = `Total shader compilation time: ${engineInstrumentation.shaderCompilationTimeCounter.total.toFixed(
            2
        )} ms`
        shaderCount.text = `Compiler shaders count: ${engineInstrumentation.shaderCompilationTimeCounter.count}`
        physicsTime.text = `Current physics time: ${sceneInstrumentation.physicsTimeCounter.current.toFixed(
            2
        )} ms`
        fps.text = `FPS: ${engine.getFps().toFixed()}`
    })
}

type ChainOptions = {
    count: number
    distance: number
    mass: number
    hideChains: boolean
}

const createChain = (startMesh, endMesh, scene, options) => {
    const defaultOptions: ChainOptions = {
        count: 3,
        distance: 0.5,
        mass: 1,
        hideChains: false,
    }

    if (options) {
        for (const key in options) {
            defaultOptions[key] = options[key]
        }
    }

    const { count, distance, mass, hideChains } = defaultOptions

    const links: AbstractMesh[] = []
    const jointData = {
        mainPivot: new Vector3(0, 0, 0),
        connectedPivot: new Vector3(0, distance, 0),
    }
    for (let i = 0; i < count; i++) {
        const link = Mesh.CreateBox(`joint-box-${i}`, 0.3, scene!).convertToUnIndexedMesh()
        link.isVisible = !hideChains

        link.position = new Vector3(
            startMesh.position.x,
            startMesh.position.y - (i + 1) * distance,
            startMesh.position.z
        )

        const physicsImposter = setPhysicsImposter(link, PhysicsImpostor.BoxImpostor, scene, {
            mass: mass,
        })

        links.push(link)

        if (i > 0) {
            links[i - 1].physicsImpostor!.createJoint(
                physicsImposter,
                PhysicsJoint.BallAndSocketJoint,
                jointData
            )
        }
    }

    if (count > 0) {
        startMesh.physicsImpostor!.createJoint(
            links[0].physicsImpostor!,
            PhysicsJoint.BallAndSocketJoint,
            jointData
        )
    } else {
        links.push(startMesh)
    }

    endMesh.position.copyFrom(links[links.length - 1].position.add(new Vector3(0, -distance, 0)))

    links[links.length - 1].physicsImpostor!.createJoint(
        endMesh.physicsImpostor!,
        PhysicsJoint.BallAndSocketJoint,
        jointData
    )

    return links
}

const createTransition = (object, prop, to, speed) => {
    const ease = new CubicEase()
    ease.setEasingMode(EasingFunction.EASINGMODE_EASEINOUT)

    return new Promise((res, rej) => {
        Animation.CreateAndStartAnimation(
            'transition-animation',
            object,
            prop,
            speed,
            120,
            object[prop],
            to,
            0,
            ease,
            res
        )
    })
}

const createLight = (scene) => {
    const light = new HemisphericLight('light', new Vector3(0, 1, 0), scene)
    light.intensity = 0.5
    light.range = 1
    light.diffuse = new Color3(0.05, 0, 0.2)
    return light
}

const setPhysicsImposter = (object, type, scene, options) => {
    return (object.physicsImpostor = new PhysicsImpostor(object, type, options, scene))
}

export {
    toggleOverlay,
    enableDebugMetrics,
    createChain,
    createLight,
    createTransition,
    setPhysicsImposter,
}
