import React, { useState } from 'react';
import styled from 'styled-components'
import HTML5Canvas from "./components/HTML5Canvas";
import { context } from 'tone';

const AppStyle = styled.div`
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
    background: radial-gradient(circle, #123, #100);]
`

const StartButton = styled.button`
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
`

const App = () => {
    const [ready, setReady] = useState(false);

    const handleStart = () => {
        setReady(true);
        context.state !== 'running' && context.resume()
    }

    return (
        <AppStyle>
            {ready ?

                <HTML5Canvas/> :

                <StartButton onClick={handleStart}>Start</StartButton>}
        </AppStyle>
    );
}

export default App;
