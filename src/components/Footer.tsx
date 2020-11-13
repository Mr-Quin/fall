import React from 'react'
import styled from 'styled-components'

const FooterStyle = styled.div`
    display: flex;
    position: absolute;
    bottom: 1em;
    color: white;
    user-select: none;
`

const Footer = (props) => {
    return <FooterStyle>{props.children}</FooterStyle>
}

export default Footer
