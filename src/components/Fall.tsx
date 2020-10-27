import React from 'react'
import styled from 'styled-components'
import useStore from '../stores/store'

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
    opacity: ${(props) => (props.ready ? 1 : 0)};
    transition: all 2s ease-in-out;
`

const Fall = (props) => {
    const fall = useStore((state) => state.actions.fall)
    return (
        <FallButton {...props} onClick={fall}>
            FALL
        </FallButton>
    )
}

export default Fall
