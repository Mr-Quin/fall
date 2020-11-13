import styled from 'styled-components'

const FullScreen = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    width: 100%;
    height: 100%;
    ${({ passPointer }) => passPointer && `pointer-events: none;`};
    background: ${({ background }) => background ?? 'none'};
    opacity: ${({ opacity }) => opacity ?? 1};
    ${({ blur }) => blur && 'backdrop-filter: blur(2px);'}
`

const Center = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`

const CenterText = styled.p`
    text-align: center;
    font-size: ${({ fontSize }) => fontSize ?? `inherit`};
`

const Button = styled.button`
    background: none;
    border: none;
    outline: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
`

const BottomLeftCorner = styled.div`
    position: absolute;
    bottom: 1em;
    left: 1em;
    user-select: none;
`

const TopRightCorner = styled.div`
    position: absolute;
    top: 1em;
    right: 1em;
    user-select: none;
`

export { FullScreen, Center, CenterText, Button, BottomLeftCorner, TopRightCorner }
