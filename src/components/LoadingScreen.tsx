import React, { DetailedHTMLProps, HTMLAttributes, SVGProps } from 'react'
import styled, { keyframes } from 'styled-components'
import useToggle from '../hooks/useToggle'
import withFade from '../styles/withFade'
import { Center } from '../styles'

const blinkAnimation = keyframes`
    0% {
    opacity: 1;
    }
    100% {
    opacity: 0;
    }
`

const BlinkDot = styled.circle`
    fill: #fff;
    stroke: none;
    animation: ${blinkAnimation} 0.5s ease-in-out alternate infinite;
    animation-delay: ${({ delay }) => delay ?? 0};
`

interface LoadingDotsProps extends SVGProps<SVGElement> {
    count?: number
    radius?: number
    space?: number
}

const LoadingDots = (props: LoadingDotsProps) => {
    const { count = 3, radius = 10, space = 10, className } = props

    const dots = Array.from(Array(count).keys())

    return (
        <svg
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            width={count * radius * 2 + (count - 1) * space}
            height={radius * 2}
            className={className}
        >
            {dots.map((n, i) => (
                // n === i, but use i for clarity
                <BlinkDot
                    cx={i * radius * 2 + space * i + radius}
                    cy={radius}
                    r={radius}
                    delay={`${i / 10}s`}
                    key={i}
                />
            ))}
        </svg>
    )
}

interface LoadingScreenProps
    extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    show?: boolean
}

const FadeCenter = withFade(Center)

const LoadingScreen = ({ show }: LoadingScreenProps) => {
    const [render, toggleRender] = useToggle(true)

    return (
        <>
            {render ? (
                <FadeCenter show={show} transition onTransitionEnd={toggleRender}>
                    <LoadingDots />
                </FadeCenter>
            ) : null}
        </>
    )
}

export default LoadingScreen
