import React, { useCallback, useEffect } from 'react'
import shallow from 'zustand/shallow'
import styled from 'styled-components'
import useStore from '../stores/store'
import AnimatedPath from './AnimatedPath'
import { Button, FullScreen } from '../styles'
import { constants, colors } from '../config/scene-config'

const {
    TITLE_ANIMATION_DELAY,
    TITLE_ANIMATION_DURATION,
    TITLE_PATH,
    TITLE_STROKE_WIDTH,
} = constants

const { TITLE_FILL_COLOR, TITLE_STROKE_COLOR } = colors

const HoverButton = styled(Button)`
    transition: all 0.3s ease-in;
    cursor: inherit;
    ${({ disabled }) =>
        !disabled &&
        `cursor: pointer;  
        pointer-events: all;  
        &:hover {
        transform: scale(1.05);
        }`}
`

const selector = (state): [() => void, boolean] => [
    state.actions.fall,
    state.titleAnimationFinished,
]
const setTitleAnimationFinished = (val: boolean) =>
    void useStore.setState({ titleAnimationFinished: val })

const TitleScreen = () => {
    const [fall, animationFinished] = useStore(selector, shallow)

    const handleClick = useCallback(async () => {
        useStore.setState({ fallen: true })
        fall()
    }, [fall])

    useEffect(() => {
        // when rendered, set a time out to fade out this title screen after all transitions are finished
        const timeout = setTimeout(
            () => void setTitleAnimationFinished(true),
            (TITLE_ANIMATION_DURATION + TITLE_ANIMATION_DELAY + 1) * 1000
        )
        return () => clearTimeout(timeout)
    }, [])

    return (
        <FullScreen>
            <HoverButton
                onClick={handleClick}
                aria-label={'Click to start'}
                disabled={!animationFinished}
            >
                {/*width and height are from first line of TITLE_PATH*/}
                <svg width={257} height={131} xmlns="http://www.w3.org/2000/svg">
                    {TITLE_PATH.map((d, i) => {
                        /**
                         * delay every path after the first one by some arbitrary amount
                         * in this case, this is to draw the letters after the box
                         */
                        const delay = i === 0 ? i : i + 4
                        return (
                            <AnimatedPath
                                key={i}
                                animationDuration={`${TITLE_ANIMATION_DURATION}s`}
                                animationDelay={`${delay / 5 + TITLE_ANIMATION_DELAY}s, ${
                                    delay / 5 + TITLE_ANIMATION_DELAY * 1.5
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
