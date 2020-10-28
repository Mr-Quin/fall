import React from 'react'
import styled from 'styled-components'

const ChordDisplayStyle = styled.h1`
    position: absolute;
    color: white;
    top: 0;
    left: 0;
`

const ChordDisplay = ({ ...props }) => {
    return <ChordDisplayStyle></ChordDisplayStyle>
}

export default ChordDisplay
