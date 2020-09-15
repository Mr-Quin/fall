import React, { useState } from 'react'
import styled from 'styled-components'
import { context } from 'tone'
import { MoodProvider } from './components/Mood'
import ChordDisplay from './components/ChordDisplay'
import SceneViewer from './components/SceneViewer'

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
    const [ready, setReady] = useState(false)

    const handleStart = () => {
        setReady(true)
    }

    return (
        <AppStyle>
            {ready ? (
                <MoodProvider>
                    <SceneViewer />
                    <ChordDisplay />
                </MoodProvider>
            ) : (
                <StartButton onClick={handleStart}>Click to start</StartButton>
            )}
        </AppStyle>
    )
}

export default App
