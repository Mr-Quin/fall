import React, { useCallback, useEffect } from 'react'
import useStore from '../stores/store'
import AnimatedPath from './AnimatedPath'
import { FullScreen, HoverButton } from '../styles'
import { constants } from '../config/scene-config'

const {
    TITLE_ANIMATION_DELAY,
    TITLE_ANIMATION_DURATION,
    TITLE_PATH,
    TITLE_FILL_COLOR,
    TITLE_STROKE_COLOR,
    TITLE_STROKE_WIDTH,
} = constants

const selector = (state) => [state.actions.fall, state.animationFinished]
const setAnimationFinished = () => void useStore.setState({ animationFinished: true })

const TitleScreen = (props) => {
    const [fall, animationFinished] = useStore(selector)

    const handleClick = useCallback(() => {
        fall()
        useStore.setState({ fallen: true })
        setAnimationFinished()
    }, [fall])

    useEffect(() => {
        if (!props.show) return
        // when rendered, set a time out to fade out this title screen after all transitions are finished
        const timeout = setTimeout(
            () => void setAnimationFinished(),
            (TITLE_ANIMATION_DURATION + TITLE_ANIMATION_DELAY + 1) * 1000
        )
        return () => clearTimeout(timeout)
    }, [props.show])

    return (
        <FullScreen background={'rgba(0,0,0,0.2)'}>
            <HoverButton
                onClick={handleClick}
                aria-label={'Click to start'}
                disabled={!animationFinished}
            >
                <svg width={257} height={131} xmlns="http://www.w3.org/2000/svg">
                    {TITLE_PATH.map((d, i) => {
                        if (i !== 0) i += 4
                        return (
                            <AnimatedPath
                                key={i}
                                animationDuration={`${TITLE_ANIMATION_DURATION}s`}
                                animationDelay={`${i / 5 + TITLE_ANIMATION_DELAY}s, ${
                                    i / 5 + TITLE_ANIMATION_DELAY * 1.5
                                }s`}
                                animationTimingFunction={'ease-in-out'}
                                stroke={TITLE_STROKE_COLOR}
                                fill={TITLE_FILL_COLOR}
                                strokeWidth={TITLE_STROKE_WIDTH}
                                animateFill
                                d={d}
                            />
                        )
                    })}
                </svg>
            </HoverButton>
        </FullScreen>
    )
}

export default TitleScreen
