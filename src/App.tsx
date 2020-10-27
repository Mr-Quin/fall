import React from 'react'
import styled from 'styled-components'
import Fall from './components/Fall'
import { context } from 'tone'
import { MoodProvider } from './components/Mood'
import ChordDisplay from './components/ChordDisplay'
import SceneViewer from './components/SceneViewer'
import useStore from './stores/store'

const AppStyle = styled.div`
    width: 100vw;
    height: 100vh;
    padding: 0;
    margin: 0;
    background: #0b033a;
`

const App = () => {
    const ready = useStore((state) => state.mutations.ready)

    return (
        <AppStyle>
            <Fall ready={ready} />
            <SceneViewer />
        </AppStyle>
    )
}

export default App
