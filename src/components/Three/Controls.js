import React, { useRef } from 'react'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls'
import { extend, useFrame, useThree } from 'react-three-fiber'

extend({ TrackballControls })

const Controls = ({ ...props }) => {
    const controls = useRef()
    const { gl, camera } = useThree()
    useFrame(() => {
        controls.current.update()
    })
    return <trackballControls args={[camera, gl.domElement]} ref={controls} />
}

export default Controls
