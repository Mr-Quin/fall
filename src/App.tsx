import React, { useEffect, Suspense } from 'react'
import useStore from './stores/store'

import TitleScreen from './components/TitleScreen'
import Genie from './components/Genie'
import Footer from './components/Footer'
import LoadingScreen from './components/LoadingScreen'

import withFade from './styles/withFade'
import { FullScreen } from './styles'

import useToggle from './hooks/useToggle'
import useFirebase from './hooks/useFirebase'
import useArt from './hooks/useArt'

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
    useArt()

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
            <Suspense fallback={null}>
                <LazyBabylonScene>
                    <Genie />
                </LazyBabylonScene>
            </Suspense>
            {devEnv ? <Footer>Development Build</Footer> : null}
        </FullScreen>
    )
}

export default App
