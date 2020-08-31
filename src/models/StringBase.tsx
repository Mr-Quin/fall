import { Gain, Destination, context } from 'tone';
import { Note } from "@tonaljs/tonal";
import { instrument, Player } from 'soundfont-player';
import { Point } from "../Types";
import { distPoint, mapValue, midPoint } from "../utils/utils";

interface StringBase {
    startPoint: Point;
    endPoint: Point;
    oscPoint: Point;
    midPoint: Point;
    gain: Gain;
    instrument: Player;
    isTriggered: boolean;
    id: number;
    onUpdate: () => void;
}

type PointsReturnType = {
    startPoint: Point,
    oscPoint: Point,
    endPoint: Point,
}

class StringBase {
    static _defaultOptions = {

    }
    private _stopThreshold: number = 1;
    private _tension: number = 850;
    private _mass: number = 0.00193461 / 1000;
    private _amplitude: number = 0;
    private _isTriggered: boolean = false;
    private _t: number = 0.5;                   // constant for computing quadratic bezier
    private _isLoaded: boolean = false;
    private _freq: number;
    private readonly _frequencyDamping: number;
    private readonly _angle: number;
    private readonly _length: number;
    private readonly _octave: number;
    private _angularFrequency: number;
    private _animationRequest;
    private _deltaTime: number = 0;

    constructor(startPoint: Point, endPoint: Point, onUpdate: () => void = () => {
    }) {
        this.id = Math.random();
        this.startPoint = startPoint;
        this.endPoint = endPoint;
        this.midPoint = midPoint(this.startPoint, this.endPoint);
        this.oscPoint = this.midPoint;
        this.gain = new Gain(5);
        this.onUpdate = onUpdate;
        this._length = distPoint(this.startPoint, this.endPoint);
        this._angle = Math.atan((this.endPoint.y - this.startPoint.y) / (this.endPoint.x - this.startPoint.x))
        this._octave = mapValue(this._length, 150, 1800, 7, 2) >> 0;                                                // longer string has slower octaves
        this._freq = Math.sqrt(this._tension / (this._mass / this._length)) / (2 * this._length);                // override with note input
        this._frequencyDamping = 1 / Math.E / (this._length / 30);                                                  // longer strings decay slower
        this._angularFrequency = 2 * Math.PI * this._freq;

        this.gain.connect(Destination);
        this.onUpdate();
        this._setSoundFont();
    }

    private _setSoundFont: () => void = () => {
        instrument(this.gain.context.rawContext as unknown as AudioContext, 'acoustic_grand_piano')
            .then(inst => {
                this.instrument = inst;
                this._isLoaded = true;
            });
    }

    private _setNextAmplitude: () => void = () => {
        this._amplitude = this._amplitude * Math.exp(-this._frequencyDamping * this._deltaTime);        // Ao exp(-σt) amplitude decay
    }

    private _setNextPosition: () => void = () => {
        const displacement = this._amplitude * Math.cos(this._deltaTime * this._angularFrequency);     // A cos(ωt)    displacement
        const x = this.midPoint.x - displacement * Math.sin(this._angle);
        const y = this.midPoint.y + displacement * Math.cos(this._angle);
        this.oscPoint = {
            x: x,
            y: y,
        }
    }

    private _update: () => void = () => {
        this._setNextAmplitude();
        this._setNextPosition();
        this._deltaTime += 1 / 60;
        this.gain.gain.value = this._amplitude / 30;
        this.onUpdate();
        if (this._amplitude < this._stopThreshold) {
            cancelAnimationFrame(this._animationRequest);
            this.reset();
            return
        }
        this._animationRequest = requestAnimationFrame(this._update)
    }

    trigger: (note?: string) => void = (note) => {   // this should take some arguments like audio frequency
        if (!this._isLoaded) return
        if (note) {
            this._freq = Note.freq(`${note}${this._octave}`) as number;
            this._angularFrequency = 2 * Math.PI * this._freq;
        }
        this._isTriggered = true;
        this._amplitude = 30;
        this._deltaTime = 0;
        this.instrument.play(Note.fromFreq(this._freq), context.currentTime, {duration: 5})
        this.gain.gain.value = 1;
        this._update();
    }

    reset: () => void = () => {
        this._isTriggered = false;
        this.gain.gain.value = 0;
        this._amplitude = 0;
        this.oscPoint = this.midPoint;
    }

    dispose: () => void = () => {
        this.gain.dispose();
    }

    getPoints: () => PointsReturnType = () => {
        const q: Point = {
            x: this.oscPoint.x,
            y: (this.oscPoint.y - Math.pow(1 - this._t, 2) * this.startPoint.y - Math.pow(this._t, 2) * this.endPoint.y) / (2 * this._t * (1 - this._t))
        }
        return {
            startPoint: this.startPoint,
            oscPoint: q,
            endPoint: this.endPoint
        }
    }

    setFreq = (note) => {
        this._freq = Note.freq(`${note}${this._octave}`) as number;
        this._angularFrequency = 2 * Math.PI * this._freq;
    }

    setOnUpdate: (callback: () => void) => void = (callback) => {
        this.onUpdate = callback
        this.onUpdate();
    }

    onTrigger: () => void = () => {

    }

    onReset: () => void = () => {

    }
}

export default StringBase
