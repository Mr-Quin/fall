import React, { useEffect, Suspense } from 'react'
import useStore from './stores/store'
import shallow from 'zustand/shallow'

import TitleScreen from './components/TitleScreen'
import Footer from './components/Footer'
import LoadingScreen from './components/LoadingScreen'
import Ui from './components/Ui'
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

const selector = (state) => [state.sceneReady, state.titleAnimationFinished, state.fallen]
const { BACKGROUND_COLOR } = colors

const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
)
const supportWebGL2 = !!document.createElement('canvas').getContext('webgl2')

// if (process.env.NODE_ENV !== 'development') {
//     console.debug = () => {}
// }

const App = () => {
    const [sceneReady, titleAnimationFinished, fallen] = useStore(selector, shallow)
    const [renderOverlayScreen, toggleRenderOverlayScreen] = useToggle(true)

    useFirebase()
    useArt()

    useEffect(() => {
        if (!fallen) return
        // unmount the entire overlay section when the star has fallen
        const timeout = setTimeout(toggleRenderOverlayScreen, 2000)
        return () => clearTimeout(timeout)
    }, [fallen])

    return (
        <FullScreen background={BACKGROUND_COLOR}>
            {supportWebGL2 ? (
                <>
                    {renderOverlayScreen && (
                        <TitleWrapper show={!fallen} passPointer>
                            <LoadingBg
                                // fadeout the opaque background after title animation finishes
                                show={!titleAnimationFinished}
                                background={BACKGROUND_COLOR}
                                duration={'3s'}
                                passPointer
                            />
                            <LoadingScreen show={!sceneReady} />
                            {sceneReady && <TitleScreen />}
                        </TitleWrapper>
                    )}

                    <Ui />

                    <Suspense fallback={null}>
                        <LazyBabylonScene />
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
