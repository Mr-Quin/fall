/**
 * Meteor is a particle system
 */
import { Vector3 } from '@babylonjs/core'

interface Meteor {}

class Meteor implements Meteor {
    private _position: Vector3

    constructor(pos: Vector3) {
        this._position = pos
    }
}

export default Meteor
