import React, { useCallback } from 'react'
import styled from 'styled-components'
import useStore from '../stores/store'
import useToggle from '../hooks/useToggle'

const FallButton = styled.button`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    color: white;
    padding: 10px 25px;
    background: none;
    outline: none;
    border: 5px solid white;
    cursor: pointer;
    font-family: 'Montserrat', sans-serif;
    font-size: 8em;
    user-select: none;
    opacity: ${(props) =>
        props.ready ^ props.fallen
            ? 1
            : 0}; // xor of ready and fallen. There is probably a better solution
    transition: all 2s ease-in-out;
`

const Fall = (props) => {
    const fall = useStore((state) => state.actions.fall)
    const [fallen, toggleFallen] = useToggle(false)

    const handleClick = useCallback(() => {
        fall()
        toggleFallen()
    }, [fall, toggleFallen])

    return (
        <FallButton {...props} fallen={fallen} onClick={handleClick}>
            FALL
        </FallButton>
    )
}

export default Fall
