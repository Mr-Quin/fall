import React, { ComponentType } from 'react'
import styled from 'styled-components'

type withFadeType<Props> = (
    Component: ComponentType<Props>,
    otherProps?: any
) => (props: any) => JSX.Element

const withFade: withFadeType<any> = (Component, otherProps?) => {
    const FadeComponent = styled(Component)`
        opacity: ${({ show }) => (show ? 1 : 0)};
        transition-property: ${({ transition }) => (transition ? 'opacity' : null)};
        transition-duration: ${({ duration }) => duration || '1.4s'};
    `
    return (props) => <FadeComponent {...props} {...otherProps} />
}

export default withFade
