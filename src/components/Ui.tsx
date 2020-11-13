import React, { useCallback } from 'react'
import styled from 'styled-components'
import withFade from '../styles/withFade'
import { Button, BottomLeftCorner } from '../styles'
import { colors } from '../config/scene-config'
import useStore from '../stores/store'
import useToggle from '../hooks/useToggle'
import shallow from 'zustand/shallow'

const StyledUI = styled(BottomLeftCorner)`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    overflow: hidden;
`

const StyledButton = styled(Button)`
    color: ${({ disabled }) => (disabled ? `darkgrey` : `white`)};
    cursor: inherit;
    transition: all 0.3s ease-in-out;
    padding: 0.5em;
    margin-bottom: 0.5em;
    border: 1px ${({ disabled }) => (disabled ? `darkgrey` : `white`)} solid;
    border-radius: 5px;
    ${({ disabled }) =>
        !disabled &&
        `cursor: pointer;  
        pointer-events: all;  
        &:hover {
        background: ${colors.BUTTON_HOVER_COLOR};
        }`}
`

const FadeUI = withFade(StyledUI)
const selector = (state) => [state.fallen, state.mutations.bounces, state.actions.takeBreak]

const Ui = () => {
    const [fallen, bounces, takeBreak] = useStore(selector, shallow)
    const [buttonClicked, toggleButtonClicked] = useToggle(false)

    const handleClick = useCallback(() => {
        takeBreak()
        // remove this function
        useStore.setState(({ actions }) => void (actions.takeBreak = () => {}) as any)
        toggleButtonClicked()
    }, [takeBreak])

    return (
        <FadeUI show={fallen}>
            <StyledButton
                onClick={handleClick}
                disabled={bounces <= 5 || buttonClicked}
                title={bounces <= 5 ? 'Try to get a few bounces before taking a break' : null}
            >
                Take a break
            </StyledButton>
            <div>Steps fallen: {bounces}</div>
        </FadeUI>
    )
}

export default Ui
