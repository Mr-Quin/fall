import React, { useEffect, Suspense } from 'react'
import useStore from './stores/store'

import TitleScreen from './components/TitleScreen'
import Genie from './components/Genie'
import Footer from './components/Footer'
import LoadingScreen from './components/LoadingScreen'
import { WebGL2Error } from './components/ErrorPage'

import withFade from './styles/withFade'
import { FullScreen } from './styles'

import useToggle from './hooks/useToggle'
import useFirebase from './hooks/useFirebase'
import useArt from './hooks/useArt'

import { colors } from './config/scene-config'

const LoadingBg = withFade(FullScreen)
const TitleWrapper = withFade(FullScreen)

const LazyBabylonScene = React.lazy(() => import('./components/3d/SceneViewer'))

const selector = (state) => [state.sceneReady, state.animationFinished, state.fallen]
const { backgroundColor } = colors

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
)
const supportWebGL2 = !!document.createElement('canvas').getContext('webgl2')

const App = () => {
    const [sceneReady, animationFinished, fallen] = useStore(selector)
    const [renderOverlayScreen, toggleRenderOverlayScreen] = useToggle(true)

    useFirebase()
    useArt()

    useEffect(() => {
        if (!fallen) return
        const timeout = setTimeout(toggleRenderOverlayScreen, 2000)
        return () => clearTimeout(timeout)
    }, [fallen])

    return (
        <FullScreen background={backgroundColor}>
            {supportWebGL2 ? (
                <>
                    {renderOverlayScreen && (
                        <TitleWrapper show={!fallen} transition passPointer>
                            <LoadingBg
                                show={!animationFinished}
                                background={backgroundColor}
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
                    {process.env.NODE_ENV === 'development' ? (
                        <Footer>Development Build</Footer>
                    ) : null}
                </>
            ) : (
                <WebGL2Error />
            )}
        </FullScreen>
    )
}

export default App
