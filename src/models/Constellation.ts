/**
 * Star is a collection of stars
 */

import Star from './Star'
import { Vector3 } from '@babylonjs/core'

interface Constellation {
    scene: any
    stars: Star[]
    lines: any[]
    addStar(position: Vector3, diameter: number, mesh: any): void
}

class Constellation {
    constructor(scene) {
        this.scene = scene
        this.stars = []
        this.lines = []
    }

    addStar = (position: Vector3, diameter: number, mesh): void => {
        this.stars.push(new Star(position, (diameter = 0.5), this.scene, mesh))
    }
}

export default Constellation
