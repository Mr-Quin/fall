import React, { useCallback, useEffect } from 'react'
import styled from 'styled-components'
import useStore from '../stores/store'
import AnimatedPath from './AnimatedPath'
import { FullScreen } from '../styles'

const HoverDiv = styled.button`
    background: none;
    border: none;
    outline: none;
    padding: 0;
    margin: 0;
    transition: all 0.3s ease-in;
    ${({ disabled }) =>
        !disabled &&
        `cursor: pointer;    
        &:hover {
        transform: scale(1.05);
        }`}
`

// const pathData = [
//     'M255,129H0V0H255ZM1,128H254V1H1Z',
//     'M48,22h33.4l-.87,5H52L46.44,56h26l-.82,4H45.67L39,95h-4.9Z',
//     'M88.54,69,74.94,95h-4.7l39-73H114l11,73h-4.48l-3.84-26Zm27.08-4L112,40.8c-.43-3.66-1.08-8.71-1.4-12.8h-.33c-1.93,4.19-3.65,8.07-6,12.58L91.21,65Z',
//     'M151.69,22h5L143.42,91h30.21l-.82,4h-35Z',
//     'M199,22h5L190.74,91H221l-.82,4h-35Z',
// ]
const pathData = [
    'M257,131H0V0H257ZM2,129H255V2H2Z',
    'M23.46,93.86V64.31H52.54l3.67-3.57v7.15H27.32V97.44H19.7Zm3.86-33.12-3.86,3.57V35.14H60l3.67-3.58v7.15H27.32Z',
    'M76.73,79.93,69.39,97.44H61.2l5.46-3.58,25-58.72h3.39l-1.79,5.17c-.09.1-4,9.41-6.4,15.34L79.65,73l-5.57,3.48h38.68l-2.62,3.48Zm48.94,17.51h-8.19l2.73-3.58L95.08,35.14l2.54-3.58Z',
    'M179.87,90.29v7.15H137.52l3.81-3.58H176.2Zm-34.73,0-3.81,3.57V35.14l3.81-3.58Z',
    'M235.3,90.29v7.15H193l3.81-3.58h34.87Zm-34.73,0-3.81,3.57V35.14l3.81-3.58Z',
]

const duration = 2
const delay = 2

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
        const timeout = setTimeout(() => void setAnimationFinished(), (duration + delay + 1) * 1000)
        return () => clearTimeout(timeout)
    }, [props.show])

    return (
        <FullScreen background={'rgba(0,0,0,0.2)'}>
            <HoverDiv
                onClick={handleClick}
                aria-label={'Click to start'}
                disabled={!animationFinished}
            >
                <svg width={257} height={131} xmlns="http://www.w3.org/2000/svg">
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
                                strokeWidth={1}
                                animateFill
                                d={d}
                            />
                        )
                    })}
                </svg>
            </HoverDiv>
        </FullScreen>
    )
}

export default TitleScreen
