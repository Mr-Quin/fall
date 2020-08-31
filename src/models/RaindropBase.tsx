import { Point } from "../Types";
import StringBase from "./StringBase";
import { randomFromArray } from "../utils/utils";

interface RaindropBase {
    position: Point;
    stringRef: {
        id: string,
        string: StringBase
    }[];
    onUpdate: () => void;
    onCollision: () => void;
    onDispose: () => void;
    notes: any;
}

class RaindropBase {
    static _defaultOptions = {
        stringRef: [],
        onUpdate: function () {
        },
        onCollision: function () {
        },
        onDispose: function () {
        }
    }
    private _a = 9.8;   // acceleration per second
    private _v = 0;     // velocity
    private _animationRequest;

    constructor(initPosition: Point, {stringRef, onUpdate, onCollision, onDispose} = RaindropBase._defaultOptions) {
        this.position = initPosition;
        this.stringRef = stringRef || RaindropBase._defaultOptions.stringRef;
        this.onUpdate = onUpdate || RaindropBase._defaultOptions.onUpdate;
        this.onCollision = onCollision || RaindropBase._defaultOptions.onCollision;
        this.onDispose = onDispose || RaindropBase._defaultOptions.onDispose;
    }

    setNextVelocity = () => {
        this._v += this._a / 60;
    }

    setNextLocation = () => {
        const x = this.position.x;
        const y = this.position.y + this._v;
        this.position = {x: x, y: y}
    }

    fall = () => {
        this.update()
    }

    update = () => {
        this.setNextLocation();
        this.setNextVelocity();
        this.onUpdate();
        this.stringRef && this.stringRef.forEach(string => {
            if (this.didCollide(string.string.startPoint, string.string.endPoint)) {
                string.string.trigger(randomFromArray(this.notes as Array<string>))
            }
        })
        if (this.position.y > 2000) {
            cancelAnimationFrame(this._animationRequest);
            this.dispose();
            return
        }
        this._animationRequest = requestAnimationFrame(this.update)
    }

    didCollide: (targetStartPoint: Point, targetEndPoint: Point) => boolean = (targetStartPoint, targetEndPoint) => {
        let lowerX = targetStartPoint.x;
        let upperX = targetEndPoint.x;
        if (upperX < lowerX) [lowerX, upperX] = [upperX, lowerX]    // guarantee lowerX is smaller
        if (this.position.x < lowerX || this.position.x > upperX) return false;     // false if not between bounds
        const slope = (targetStartPoint.y - targetEndPoint.y) / (targetStartPoint.x - targetEndPoint.x)
        const targetY = slope * (this.position.x - targetStartPoint.x) + targetStartPoint.y;
        return this.position.y < targetY + 10 && this.position.y > targetY - 10;
    }

    getPosition = () => {
        return this.position;
    }

    setOnUpdate = (callback) => {
        this.onUpdate = callback;
    }

    dispose = () => {
        console.log('rain disposed')
    }


}

export default RaindropBase;
