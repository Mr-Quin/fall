import {
    Color4,
    GPUParticleSystem,
    NoiseProceduralTexture,
    ParticleSystem,
    ProceduralTexture,
    Texture,
    Vector3,
    Scene,
} from '@babylonjs/core'
import { colors } from '../config/scene-config'

type StarFieldParticleSystemOptions = {
    capacity: number
    texture: Texture
    noiseTexture: ProceduralTexture
    noiseStrength?: Vector3
    color1: Color4
    color2: Color4
    maxSize?: number
    minSize?: number
    emitterSize?: number
}

type AmbientParticleSystemOptions = Omit<StarFieldParticleSystemOptions, 'emitterSize'>

const createCollisionParticleSystem = (texture: Texture, capacity: number, scene: Scene) => {
    const ps = new ParticleSystem('collision-ps', capacity, scene)
    ps.createPointEmitter(Vector3.Zero(), Vector3.Zero())
    ps.particleTexture = texture
    ps.color1 = Color4.FromHexString(colors.STAR_COLOR_PRIMARY)
    ps.color2 = Color4.FromHexString(colors.STAR_COLOR_SECONDARY)
    ps.colorDead = Color4.FromHexString(colors.TRANSPARENT)
    ps.minSize = 0.2
    ps.maxSize = 0.4
    ps.minLifeTime = 0.7
    ps.maxLifeTime = 1
    ps.minEmitPower = 1
    ps.maxEmitPower = 1
    ps.addVelocityGradient(0, 3, 6)
    ps.addVelocityGradient(1.0, -0.5, -1)
    ps.addDragGradient(0, 0.3)
    ps.addDragGradient(1, 0.7)
    ps.minAngularSpeed = -Math.PI * 2
    ps.maxAngularSpeed = Math.PI * 2
    ps.direction1 = new Vector3(-1, -1, -1)
    ps.direction2 = new Vector3(1, 1, 1)
    ps.gravity = new Vector3(0, 0, 0)
    ps.manualEmitCount = 0
    ps.emitRate = 0
    return ps
}

const createStarFieldParticleSystem = (options: StarFieldParticleSystemOptions, scene: Scene) => {
    const {
        capacity,
        texture,
        noiseTexture,
        noiseStrength = new Vector3(0.5, 0.5, 0.5),
        color1,
        color2,
        maxSize = 0.5,
        minSize = 0.05,
        emitterSize = 40,
    } = options
    const ps = new GPUParticleSystem(
        'star-field',
        { capacity: capacity, randomTextureSize: 1024 },
        scene
    )
    ps.noiseTexture = noiseTexture
    ps.noiseStrength = noiseStrength
    ps.createBoxEmitter(
        Vector3.Zero(),
        Vector3.Zero(),
        new Vector3(-emitterSize / 2, -emitterSize / 2, -emitterSize / 2),
        new Vector3(emitterSize / 2, emitterSize / 2, emitterSize / 2)
    )
    ps.particleTexture = texture
    ps.addColorGradient(0, Color4.FromHexString(colors.TRANSPARENT))
    ps.addColorGradient(0.1, color1)
    ps.addColorGradient(0.5, color2)
    ps.addColorGradient(0.9, color2)
    ps.addColorGradient(1, Color4.FromHexString(colors.TRANSPARENT))
    ps.minSize = minSize
    ps.maxSize = maxSize
    ps.minLifeTime = 3
    ps.maxLifeTime = 6
    ps.preWarmCycles = 600
    ps.minEmitPower = -1
    ps.maxEmitPower = 1
    ps.minAngularSpeed = -Math.PI
    ps.maxAngularSpeed = Math.PI
    ps.gravity = new Vector3(0, 0, 0)
    ps.emitRate = capacity / 3
    return ps
}

const createAmbientParticleSystem = (options: AmbientParticleSystemOptions, scene: Scene) => {
    const {
        capacity,
        texture,
        noiseTexture,
        noiseStrength = new Vector3(1, 1, 1),
        color1,
        color2,
        maxSize = 0.05,
        minSize = 0.05,
    } = options
    const ps = new GPUParticleSystem(
        'ambient-ps',
        { capacity: capacity, randomTextureSize: 1024 },
        scene
    )
    ps.noiseTexture = noiseTexture
    ps.noiseStrength = noiseStrength
    ps.createBoxEmitter(
        new Vector3(0, 1, 0),
        Vector3.Zero(),
        new Vector3(-10, 2, -10),
        new Vector3(10, -2, 10)
    )
    ps.particleTexture = texture
    ps.minSize = minSize
    ps.maxSize = maxSize
    ps.addColorGradient(0, Color4.FromHexString(colors.TRANSPARENT))
    ps.addColorGradient(0.2, color1)
    ps.addColorGradient(0.8, color2)
    ps.addColorGradient(1, Color4.FromHexString(colors.TRANSPARENT))
    ps.addSizeGradient(0, 0.2)
    ps.addSizeGradient(0.3, 0.02)
    ps.addSizeGradient(0.7, 0.15)
    ps.addSizeGradient(1, 0.02)
    ps.maxEmitPower = 0
    ps.minEmitPower = 0
    ps.minLifeTime = 3
    ps.maxLifeTime = 7
    ps.emitRate = capacity / 5
    return ps
}

const createTrailParticleSystem = (capacity, texture, scene) => {
    const gpuParticleSystem = new GPUParticleSystem(
        'trail-ps',
        { capacity: capacity, randomTextureSize: 1024 },
        scene
    )
    const noiseTexture = new NoiseProceduralTexture('perlin', 256, scene)
    noiseTexture.animationSpeedFactor = 2
    noiseTexture.brightness = 0.5
    noiseTexture.octaves = 5
    gpuParticleSystem.noiseTexture = noiseTexture

    gpuParticleSystem.noiseStrength = new Vector3(1, 1, 1)
    gpuParticleSystem.emitRate = 5
    gpuParticleSystem.minLifeTime = 0.2
    gpuParticleSystem.maxLifeTime = 0.4
    gpuParticleSystem.createPointEmitter(Vector3.Zero(), Vector3.Zero())
    gpuParticleSystem.particleTexture = texture
    gpuParticleSystem.updateSpeed = 1 / 100
    gpuParticleSystem.maxInitialRotation = Math.PI
    gpuParticleSystem.maxInitialRotation = -Math.PI

    gpuParticleSystem.addColorGradient(0, new Color4(0, 0, 0, 0))
    gpuParticleSystem.addColorGradient(
        0.05,
        new Color4(0.4, 0.3, 0.8, 1),
        new Color4(0.2, 0.9, 0.8, 1)
    )
    gpuParticleSystem.addColorGradient(0.8, new Color4(0.8, 0.3, 0.2, 1))
    gpuParticleSystem.addColorGradient(1, new Color4(0, 0, 0, 0))

    gpuParticleSystem.addSizeGradient(0, 0.8)
    gpuParticleSystem.addSizeGradient(1, 0)

    gpuParticleSystem.maxEmitPower = 0
    gpuParticleSystem.minEmitPower = 0

    return gpuParticleSystem
}

export {
    createAmbientParticleSystem,
    createCollisionParticleSystem,
    createTrailParticleSystem,
    createStarFieldParticleSystem,
}
