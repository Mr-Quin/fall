import React from 'react'
import { Center, CenterText } from '../styles'

const ErrorPage = Center

const WebGL2Error = () => {
    return (
        <ErrorPage>
            <CenterText as={'h1'}>It looks like your browser does not support WebGL 2.0</CenterText>
            <CenterText>This website requires webGL 2.0 to run.</CenterText>
            <CenterText>
                Currently, WebGL2 is not supported on Safari and iOS Safari. Please use the latest
                version of Chrome, Firefox, or Edge for the best viewing experience.
            </CenterText>
            <CenterText>
                See{' '}
                <a href={'https://caniuse.com/webgl2'} target={'blank'}>
                    this page
                </a>{' '}
                for a list of browsers that support WebGL 2. If you are using a supported browser,
                you may have turned this feature off in the settings.
            </CenterText>
        </ErrorPage>
    )
}

export default WebGL2Error
