import {
    BaseParticleSystem,
    GPUParticleSystem,
    ParticleSystem,
    ProceduralTexture,
    Scene,
    Texture,
} from '@babylonjs/core'

export const logArt = () => {
    console.log(
        `%c
                    *****/     .-._.---'  /\\         .-.        .-. 
         ,       *******//     (_) /   _  / |        / (_)      / (_)
        ,,,,,/*********//         /--.(  /  |  .    /          /       
        ,,,,,,,,,,,,,*//         /     \`/.__|_.'   /          /        
      ,,,,,,,,,,,,,,*///      .-/  .:' /    |   .-/.    .-..-/.    .-.
  ,,,,,,,,,,,,,,,,,*///      (_/  (__.'     \`-'(_/ \`-._.  (_/ \`-._.
      ,,,,,,,,,,,,,,//        
        ,,,,,,,,,,,,,,        
         ,,,,                
          ,,                
               %cPowered by React.js and Babylon.js`,
        `color: ${colors.starColorPrimary};`,
        "background-color:black; padding:5px; font-family: 'Poiret One', cursive; font-size: 1.5em"
    )
    ;(window as any).logArt = logArt || {}
}

const titlePath = [
    'M257,131H0V0H257ZM2,129H255V2H2Z',
    'M23.46,93.86V64.31H52.54l3.67-3.57v7.15H27.32V97.44H19.7Zm3.86-33.12-3.86,3.57V35.14H60l3.67-3.58v7.15H27.32Z',
    'M76.73,79.93,69.39,97.44H61.2l5.46-3.58,25-58.72h3.39l-1.79,5.17c-.09.1-4,9.41-6.4,15.34L79.65,73l-5.57,3.48h38.68l-2.62,3.48Zm48.94,17.51h-8.19l2.73-3.58L95.08,35.14l2.54-3.58Z',
    'M179.87,90.29v7.15H137.52l3.81-3.58H176.2Zm-34.73,0-3.81,3.57V35.14l3.81-3.58Z',
    'M235.3,90.29v7.15H193l3.81-3.58h34.87Zm-34.73,0-3.81,3.57V35.14l3.81-3.58Z',
]

export const sceneConfig = {
    HALF_PI: Math.PI / 2,
    TITLE_CAMERA_ALPHA: 0.6,
    TITLE_CAMERA_BETA: 0.4,
    TITLE_PATH: titlePath,
    TITLE_ANIMATION_DELAY: 2,
    TITLE_ANIMATION_DURATION: 2,
    TITLE_STROKE_COLOR: '#fff',
    TITLE_FILL_COLOR: '#fff',
    TITLE_STROKE_WIDTH: 1,
}

export const colors = {
    transparent: '#00000000',
    backgroundColor: '#111122',
    starColorPrimary: '#ffbb00',
    starColorSecondary: '#ffee66',
    particleColor1: '#ee5533',
    particleColor2: '#9955dd',
    particleColor3: '#66ccee',
    particleColor4: '#117fff',
    particleColor5: '#77cc55',
    particleColor6: '#ff66aa',
}

type Gradient<T> = [number, T, T?]

type EmitterType =
    | 'Box'
    | 'Cone'
    | 'CylinderDirected'
    | 'Cylinder'
    | 'Hemispheric'
    | 'Mesh'
    | 'Point'
    | 'Sphere'
    | 'SphereDirected'

interface ParticleSystemOptions
    extends Partial<Omit<BaseParticleSystem, 'noiseTexture' | 'particleTexture'>> {
    name: string
    capacity: number
    randomTextureSize?: number
    sizeGradient?: any[]
    colorGradient?: any[]
}

export const createParticleSystem = <T>(
    texture: Texture,
    scene: Scene,
    options: ParticleSystemOptions,
    gpu?: boolean,
    noiseTexture?: ProceduralTexture
): ParticleSystem | GPUParticleSystem => {
    let ps: ParticleSystem | GPUParticleSystem
    const { name, capacity, randomTextureSize = 1024 } = options

    if (gpu)
        ps = new GPUParticleSystem(
            name,
            { capacity: capacity, randomTextureSize: randomTextureSize },
            scene
        )
    else ps = new ParticleSystem(name, capacity, scene)

    for (const optionsKey in options) {
        if (ps.hasOwnProperty(optionsKey)) ps[optionsKey] = options[optionsKey]
    }

    ps.particleTexture = texture
    noiseTexture && (ps.noiseTexture = noiseTexture)

    return ps
}

/*
    TODO: Refactor:
          Move default values to config
          Use config for particle systems
          Detect GPU to set particle count
          CPU Particle fallback
          Reduce imperative code
 */

/*
    TODO: Features:
          No repeated sound on bounce   --- done
          Background color change with time/sound
          Noise background?
          Step colors?
          Particle color change?
          Ambient sound
          Button to end game by making ground
 */
