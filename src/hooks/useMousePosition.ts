import { useEffect, useState } from 'react'
import { Point } from '../Types'

interface useMousePositionFunc {
    (): Point
}

const useMousePosition: useMousePositionFunc = () => {
    const [mousePosition, setMousePosition] = useState<Point>({ x: 0, y: 0 })

    const handleMouseMove = (e: MouseEvent) => {
        setMousePosition({ x: e.pageX, y: e.pageY })
    }

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove)

        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
        }
    }, [])

    return mousePosition
}

export default useMousePosition
