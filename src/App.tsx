import React, { useEffect } from 'react'
import TitleScreen from './components/TitleScreen'
import Mood from './components/Mood'
import useStore from './stores/store'
import Footer from './components/Footer'
import LoadingScreen from './components/LoadingScreen'
import withFade from './styles/withFade'
import useToggle from './hooks/useToggle'
import { FullScreen } from './styles'
import { logArt } from './config/scene-config'
import useFirebase from './hooks/useFirebase'

const LoadingBg = withFade(FullScreen)
const TitleWrapper = withFade(FullScreen)

const LazyBabylonScene = React.lazy(() => import('./components/3d/SceneViewer'))

const selector = (state) => [state.sceneReady, state.animationFinished, state.fallen]
const background = useStore.getState().defaults.backgroundColor

const devEnv = process.env.NODE_ENV === 'development'
const App = () => {
    const [sceneReady, animationFinished, fallen] = useStore(selector)
    const [renderLoadingScreen, toggleRenderLoadingScreen] = useToggle(true)

    useFirebase()

    useEffect(() => {
        logArt()
    }, [])

    useEffect(() => {
        if (!fallen) return
        const timeout = setTimeout(toggleRenderLoadingScreen, 2000)
        return () => clearTimeout(timeout)
    }, [fallen])

    return (
        <FullScreen background={background}>
            {renderLoadingScreen && (
                <TitleWrapper show={!fallen} transition passPointer>
                    <LoadingBg
                        show={!animationFinished}
                        background={background}
                        transition
                        duration={'3s'}
                        passPointer
                    />
                    <LoadingScreen show={!sceneReady} />
                    {sceneReady && <TitleScreen show />}
                </TitleWrapper>
            )}
            {fallen && <Mood />}
            <React.Suspense fallback={null}>
                <LazyBabylonScene />
            </React.Suspense>
            {devEnv ? <Footer>Development Build</Footer> : null}
        </FullScreen>
    )
}

export default App
