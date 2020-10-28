import styled from 'styled-components'

const FullScreen = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    width: 100vw;
    height: 100vh;
    background: ${({ background }) => background || 'none'};
    ${({ blur }) => blur && 'backdrop-filter: blur(2px);'}
`

const Center = styled.div`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`

const Fade = styled.div`
    opacity: ${({ show }) => (show ? 1 : 0)};
    transition: ${({ transition }) => (transition ? 'all 1.4s' : null)};
`

export { FullScreen, Center, Fade }
