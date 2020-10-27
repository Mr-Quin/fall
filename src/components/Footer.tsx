import React from 'react'
import styled from 'styled-components'

const FooterStyle = styled.div`
    position: absolute;
    left: 50%;
    bottom: 1em;
    transform: translate(-50%, -50%);
    color: white;
    user-select: none;
`

const Footer = (props) => {
    return <FooterStyle>{props.children}</FooterStyle>
}

export default Footer
