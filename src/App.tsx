import React, { useEffect } from 'react'
import TitleScreen from './components/TitleScreen'
import SceneViewer from './components/3d/SceneViewer'
import Mood from './components/Mood'
import useStore from './stores/store'
import Footer from './components/Footer'
import LoadingScreen from './components/LoadingScreen'
import withFade from './components/hoc/withFade'
import useToggle from './hooks/useToggle'
import { FullScreen } from './styles'

const LoadingBg = withFade(FullScreen)
const TitleWrapper = withFade(FullScreen)

const selector = (state) => [state.sceneReady, state.animationFinished, state.fallen]
const background = useStore.getState().defaults.backgroundColor

const App = () => {
    const [sceneReady, animationFinished, fallen] = useStore(selector)
    const [renderLoadingScreen, toggleRenderLoadingScreen] = useToggle(true)

    useEffect(() => {
        if (!fallen) return
        const timeout = setTimeout(toggleRenderLoadingScreen, 2000)
        return () => clearTimeout(timeout)
    }, [fallen])

    return (
        <FullScreen background={background}>
            {renderLoadingScreen && (
                <TitleWrapper show={!fallen} transition>
                    <LoadingBg
                        show={!animationFinished}
                        background={background}
                        transition
                        duration={'3s'}
                    />
                    <LoadingScreen show={!sceneReady} />
                    {sceneReady && <TitleScreen show={sceneReady} />}
                </TitleWrapper>
            )}
            {fallen && <Mood />}
            <SceneViewer />
            {process.env.NODE_ENV === 'development' ? <Footer>Development Build</Footer> : null}
        </FullScreen>
    )
}

export default App
