import { Curve, Group, Line, Num } from 'pts'
import { FMSynth, Gain, Synth, ToneAudioNode } from 'tone'
import { mapValue } from '../utils/utils'

interface Chord {
    freq: number
    dampening: number
    isOscillating: boolean
}

class Chord {
    private _amplitude: number
    private _deltaTime: number
    private _curve: Group
    private _refPts: Group
    private synth: FMSynth
    private readonly gain: Gain
    private readonly octave: number

    constructor(group: Group, audioDestination: ToneAudioNode, octave: number = 4) {
        this._curve = group
        this._refPts = new Group(group.p2, group.q2)
        this._amplitude = 0
        this.octave = mapValue(Line.magnitude(this.line), 130, 1200, 7, 1) << 0
        this.freq = Math.PI * 2 * 8.1
        this.gain = new Gain(0).connect(audioDestination)
        this.synth = new FMSynth({
            harmonicity: 8,
            modulationIndex: 2,
            oscillator: {
                type: 'sine',
            },
            envelope: {
                attack: 0.001,
                decay: 2,
                sustain: 0.1,
                release: 2,
            },
            modulation: {
                type: 'square',
            },
            modulationEnvelope: {
                attack: 0.002,
                decay: 0.2,
                sustain: 0,
                release: 0.2,
            },
        }).connect(this.gain)
        this.dampening = 1 / Math.E / (Line.magnitude(this.line) / 30)
        this._deltaTime = 0
        this.isOscillating = false
        console.log(this.octave)
    }

    get pts() {
        return Group.fromPtArray([...this._curve, ...this._refPts])
    }

    get line() {
        return Group.fromPtArray([this._curve.p1, this._curve.q1])
    }

    get curve() {
        return Curve.bezier(this._curve)
    }

    get canTrigger() {
        return this._amplitude < 10
    }

    trigger = (freq: string = 'a'): void => {
        this._amplitude = 30
        this._deltaTime = 0
        this.isOscillating = true
        this.gain.gain.rampTo(1, 0.005)
        this.synth.triggerAttackRelease(`${freq}${this.octave}`, '1n')
        console.log('trigger')
    }

    private _updateAmplitude = (): this => {
        this._amplitude = this._amplitude * Math.exp(-this.dampening * this._deltaTime)
        return this
    }

    private _updatePts = (): this => {
        const displacement = this._amplitude * Math.cos(this._deltaTime * this.freq) // A cos(ωt)
        const slope = Line.slope(this._curve.p1, this._curve.q1)
        const angle = Math.atan(slope)
        this._curve[1] = this._refPts.p1.$add([
            -displacement * Math.sin(angle),
            displacement * Math.cos(angle),
        ])
        this._curve[2] = this._refPts.q1.$add([
            -displacement * Math.sin(angle),
            displacement * Math.cos(angle),
        ])
        return this
    }

    update = (): void => {
        this._deltaTime += 1 / 10
        this._updateAmplitude()._updatePts()
        this.gain.gain.value = Num.normalizeValue(this._amplitude, 0, 30)
        if (this._amplitude < 0.5) this.reset()
    }

    render = (): void => {}

    reset = (): void => {
        this.gain.gain.rampTo(0, 0.01)
        this._deltaTime = 0
        this._amplitude = 0
        this.isOscillating = false
        console.log('reset')
    }
}

export default Chord
