import styled, { keyframes } from 'styled-components'

const FullScreen = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    width: 100vw;
    height: 100vh;
    ${({ passPointer }) => passPointer && `pointer-events: none;`};
    background: ${({ background }) => background || 'none'};
    opacity: ${({ opacity }) => opacity || 1};
    ${({ blur }) => blur && 'backdrop-filter: blur(2px);'}
`

const Center = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`

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
    animation-delay: ${({ delay }) => delay || 0};
`

const HoverButton = styled.button`
    background: none;
    border: none;
    outline: none;
    padding: 0;
    margin: 0;
    transition: all 0.3s ease-in;
    ${({ disabled }) =>
        !disabled &&
        `cursor: pointer;  
        pointer-events: all;  
        &:hover {
        transform: scale(1.05);
        }`}
`

export { FullScreen, Center, BlinkDot, HoverButton }
