import React, { DetailedHTMLProps, HTMLAttributes, SVGProps } from 'react'
import useToggle from '../hooks/useToggle'
import withFade from './hoc/withFade'
import { Center } from '../styles'

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
                <circle
                    fill="#fff"
                    stroke="none"
                    cx={i * radius * 2 + space * i + radius}
                    cy={radius}
                    r={radius}
                    key={i}
                >
                    <animate
                        attributeName="opacity"
                        dur="1s"
                        values="0;1;0"
                        repeatCount="indefinite"
                        begin={i / 10}
                    />
                </circle>
            ))}
        </svg>
    )
}

interface LoadingScreenProps
    extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    show?: boolean
}

const FadeDots = withFade(LoadingDots)

const LoadingScreen = ({ show }: LoadingScreenProps) => {
    /**
     * TODO: find out why transition event isn't working
     */
    const [render, toggleRender] = useToggle(true)

    return (
        <>
            {render ? (
                <Center>
                    <FadeDots show={show} transition onTransitionEnd={toggleRender} />
                </Center>
            ) : null}
        </>
    )
}

export default LoadingScreen
