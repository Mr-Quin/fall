import { Vector3 } from '@babylonjs/core'

const titlePath = [
    'M257,131H0V0H257ZM2,129H255V2H2Z',
    'M23.46,93.86V64.31H52.54l3.67-3.57v7.15H27.32V97.44H19.7Zm3.86-33.12-3.86,3.57V35.14H60l3.67-3.58v7.15H27.32Z',
    'M76.73,79.93,69.39,97.44H61.2l5.46-3.58,25-58.72h3.39l-1.79,5.17c-.09.1-4,9.41-6.4,15.34L79.65,73l-5.57,3.48h38.68l-2.62,3.48Zm48.94,17.51h-8.19l2.73-3.58L95.08,35.14l2.54-3.58Z',
    'M179.87,90.29v7.15H137.52l3.81-3.58H176.2Zm-34.73,0-3.81,3.57V35.14l3.81-3.58Z',
    'M235.3,90.29v7.15H193l3.81-3.58h34.87Zm-34.73,0-3.81,3.57V35.14l3.81-3.58Z',
]

export const constants = {
    A0_MIDI_NUMBER: 21,
    A3_MIDI_NUMBER: 57,
    A5_MIDI_NUMBER: 81,
    CAMERA_FOLLOW_SPEED: 0.1,
    CAMERA_FOV: 0.6,
    CAMERA_LOWER_RADIUS: 10,
    CAMERA_UPPER_RADIUS: 25,
    END_ANIMATION_DELAY: 2,
    END_CAMERA_ANIMATION_DURATION: 10,
    END_CAMERA_Y_OFFSET: 100,
    END_FIRST_STEP_OFFSET: new Vector3(5, 0, 5),
    END_FLOOR_Y_OFFSET: 30,
    END_FOG_ANIMATION_SPEED: 0.02,
    END_STAR_VELOCITY_THRESHOLD: 0.25,
    FOG_DENSITY: 0.05,
    FXAA_STRENGTH: 1,
    GENIE_TEMPERATURE: 0.25,
    LIGHT_BASE_INTENSITY: 0.3,
    LIGHT_BLINK_INTENSITY: 1,
    STARLIGHT_DISTANCE: 15,
    TITLE_ANIMATION_DELAY: 2,
    TITLE_ANIMATION_DURATION: 2,
    TITLE_CAMERA_ALPHA: 0.6,
    TITLE_CAMERA_BETA: 0.4,
    TITLE_CAMERA_SPEED: 0.02,
    TITLE_PATH: titlePath,
    TITLE_STROKE_WIDTH: 1,
}

export const colors = {
    BACKGROUND_COLOR: '#111122ff',
    PARTICLE_COLOR_1: '#cc4d33ff',
    PARTICLE_COLOR_2: '#663399ff',
    PARTICLE_COLOR_3: '#1a80ffff',
    PARTICLE_COLOR_4: '#8099ccff',
    PARTICLE_COLOR_5: '#ccb333ff',
    PARTICLE_COLOR_6: '#ff4d99ff',
    STAR_COLOR_PRIMARY: '#ffbd34ff',
    STAR_COLOR_SECONDARY: '#ffee66ff',
    STAR_LIGHT_COLOR: '#ffffccff',
    TITLE_FILL_COLOR: '#ffffffff',
    TITLE_STROKE_COLOR: '#ffffffff',
    GITHUB_ICON_COLOR: '#676767ff',
    BUTTON_HOVER_COLOR: '#222233ff',
    TRANSPARENT: '#00000000',
}

export const cameraLensParameters = {
    chromatic_aberration: 0.5,
    distortion: 0.5,
    dof_aperture: 0.8,
    dof_focus_distance: 1,
    dof_pentagon: true,
    edge_blur: 0.5,
    grain_amount: 0.2,
}
