import { Animation } from '@babylonjs/core'

const createBlinkAnimation = (orig) => {
    const animation = new Animation(
        'blink-animation',
        'intensity',
        30,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CYCLE
    )
    const blinkKeys = [
        {
            frame: 0,
            value: orig,
        },
        {
            frame: 5,
            value: 0.5,
        },
        {
            frame: 10,
            value: orig,
        },
    ]
    animation.setKeys(blinkKeys)

    return animation
}

export { createBlinkAnimation }
