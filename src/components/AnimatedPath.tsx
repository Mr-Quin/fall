import React, { useRef } from 'react'
import styled, { keyframes } from 'styled-components'

const strokeAnim = keyframes`
  to {
    stroke-dashoffset: 0;
  }
`

const pathAnim = keyframes`
    to {
      fill-opacity: 1;
    }
`

const StyledPath = styled.path`
    stroke-dasharray: ${(props) => props.length};
    stroke-dashoffset: ${(props) => props.length};
    fill-opacity: ${(props) => (props.animateFill ? 0 : 1)};
    animation-name: ${strokeAnim}, ${pathAnim};
    animation-duration: ${(props) => props.animationDuration || '1s'};
    animation-fill-mode: ${(props) => props.animationFillMode || 'forwards'};
    animation-delay: ${(props) => props.animationDelay || '0, 1s'};
    animation-timing-function: ${(props) => props.animationTimingFunction || 'linear'};
`

interface Props extends Partial<React.SVGProps<SVGPathElement>> {
    animationDuration?: string | 0
    animationFillMode?: string
    animationDelay?: string | 0
    animationTimingFunction?: string
    animateFill?: boolean
}

const AnimatedPath = (props?: Props) => {
    const path = useRef<SVGPathElement>()
    const length = path.current?.getTotalLength()
    return <StyledPath ref={path} length={length} {...props} />
}

export default AnimatedPath
