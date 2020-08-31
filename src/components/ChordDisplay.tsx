import React from 'react';
import styled from 'styled-components'
import { useMood } from "./Mood";

const ChordDisplayStyle = styled.h1`
    position: absolute;
    color: white;
    top: 0;
    left: 0;
`

const ChordDisplay = ({...props}) => {
    const {chordName, bpm} = useMood()

    return (
        <ChordDisplayStyle>{chordName} bpm:{bpm}</ChordDisplayStyle>
    )
}

export default ChordDisplay
