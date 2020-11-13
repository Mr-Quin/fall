import React, { useCallback } from 'react'
import styled from 'styled-components'
import withFade from '../styles/withFade'
import { Button, Corner } from '../styles'
import useStore from '../stores/store'
import useToggle from '../hooks/useToggle'

const StyledUI = styled(Corner)`
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
        background: darkgrey;
        }`}
`

const FadeUI = withFade(StyledUI)
const selector = (state) => [state.fallen, state.mutations.bounces, state.actions.endJourney]

const Ui = () => {
    const [fallen, bounces, endJourney] = useStore(selector)
    const [buttonClicked, toggleButtonClicked] = useToggle(false)

    const handleClick = useCallback(() => {
        endJourney()
        // remove this function
        useStore.setState(({ actions }) => void (actions.endJourney = () => {}) as any)
        toggleButtonClicked()
    }, [endJourney])

    return (
        <FadeUI show={fallen}>
            <StyledButton
                onClick={handleClick}
                disabled={bounces <= 5 || buttonClicked}
                title={bounces <= 5 ? 'Try to get 5 bounces before ending your journey' : null}
            >
                End this journey
            </StyledButton>
            <div>Steps fallen: {bounces}</div>
        </FadeUI>
    )
}

export default Ui
