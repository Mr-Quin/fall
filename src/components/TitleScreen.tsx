import React, { useCallback, useEffect } from 'react'
import styled, { keyframes } from 'styled-components'
import useStore from '../stores/store'
import AnimatedPath from './AnimatedPath'
import { Center } from '../styles'

const shiftDown = keyframes`
 0% { top: 50%;transform: translate(-50%, -50%) scale(1)}
 100% { top: 75%; transform: translate(-50%, -50%) scale(0.6)}
`

const blink = keyframes`
 0% { top: 75%; transform: translate(-50%, -50%) scale(0.6)}
 40% { top: 75%; transform: translate(-50%, -50%) scale(0.65)}
 100% { top: 75%; transform: translate(-50%, -50%) scale(0.6)}
`

const HoverDiv = styled.button`
    background: none;
    border: none;
    outline: none;
    transition: all 0.3s ease-in;
    cursor: pointer;
    &:hover {
        transform: scale(1.03);
    }
`

const pathData = [
    'M255,129H0V0H255ZM1,128H254V1H1Z',
    'M48,22h33.4l-.87,5H52L46.44,56h26l-.82,4H45.67L39,95h-4.9Z',
    'M88.54,69,74.94,95h-4.7l39-73H114l11,73h-4.48l-3.84-26Zm27.08-4L112,40.8c-.43-3.66-1.08-8.71-1.4-12.8h-.33c-1.93,4.19-3.65,8.07-6,12.58L91.21,65Z',
    'M151.69,22h5L143.42,91h30.21l-.82,4h-35Z',
    'M199,22h5L190.74,91H221l-.82,4h-35Z',
]

const duration = 2
const delay = 2

const selector = (state) => state.actions.fall
const endTitleScreen = () => void useStore.setState({ animationFinished: true })

const TitleScreen = (props) => {
    const fall = useStore(selector)

    const handleClick = useCallback(() => {
        fall()
        useStore.setState({ fallen: true })
        endTitleScreen()
    }, [fall])

    useEffect(() => {
        if (!props.show) return
        // when rendered, set a time out to fade out this title screen after all transitions are finished
        const timeout = setTimeout(() => void endTitleScreen(), (duration + delay + 1) * 1000)
        return () => clearTimeout(timeout)
    }, [props.show])

    return (
        <Center onClick={handleClick}>
            <HoverDiv>
                <svg width={255} height={129} xmlns="http://www.w3.org/2000/svg">
                    {pathData.map((d, i) => {
                        if (i !== 0) i += 4
                        return (
                            <AnimatedPath
                                key={i}
                                animationDuration={`${duration}s`}
                                animationDelay={`${i / 5 + delay}s, ${i / 5 + delay * 1.5}s`}
                                animationTimingFunction={'ease-in-out'}
                                stroke={'#eee'}
                                fill={'#eee'}
                                strokeWidth={2}
                                animateFill
                                d={d}
                            />
                        )
                    })}
                </svg>
            </HoverDiv>
        </Center>
    )
}

export default TitleScreen
