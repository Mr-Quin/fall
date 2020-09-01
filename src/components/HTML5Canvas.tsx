import React from 'react';
import styled from 'styled-components'
import { Pt, Group, Noise, Create, Curve, Line, Sound, Const, Form, Num, Color } from 'pts'
import { PtsCanvas } from 'react-pts-canvas'
import { Synth, Gain } from "tone";

const StyledCanvas = styled.div`
    width: 100%;
    height: 100%;
`

interface String {
    line: Group;
    refPts: Group;
    amplitude: number;
    freq: number;
    dampening: number;
    isOscillating: boolean;
    deltaTime: number;
}

class String {
    private readonly _curve: Group;
    private newP2: Pt;
    private newQ2: Pt;
    private synth: Synth;
    private gain: Gain;

    constructor(group: Group, audioDestination) {
        this._curve = group;
        this.newP2 = group.p2;
        this.newQ2 = group.q2;
        this.line = new Group(group.p1, group.q1)
        this.refPts = new Group(group.p2, group.q2);
        this.amplitude = 0;
        this.freq = Math.PI * 2 * (Math.random() * 6 + 4);
        this.gain = new Gain(0).connect(audioDestination);
        this.synth = new Synth().connect(this.gain);
        this.dampening = 1 / Math.E / (Line.magnitude(this.line) / 30);
        this.deltaTime = 0;
        this.isOscillating = false;
    }

    get curve() {
        return Curve.bezier([this.line.p1, this.newP2, this.newQ2, this.line.q1])
    }

    trigger = (): void => {
        this.amplitude = 30;
        this.isOscillating = true;
        this.gain.gain.rampTo(1,0.05);
        this.synth.triggerAttackRelease(Math.random() * 6000 + 100, '1n');
        console.log('trigger')
    }

    updateAmplitude = (): void => {
        this.amplitude = this.amplitude * Math.exp(-this.dampening * this.deltaTime);
    }

    updatePts = (): void => {
        const displacement = this.amplitude * Math.cos(this.deltaTime * this.freq);     // A cos(ωt)
        const slope = Line.slope(this.line.p1, this.line.q1);
        const angle = Math.atan(slope);
        this.newP2 = this.refPts.p1.$add(-displacement * Math.sin(angle), displacement * Math.cos(angle));
        this.newQ2 = this.refPts.q1.$add(-displacement * Math.sin(angle), displacement * Math.cos(angle));
    }

    update = (): void => {
        this.deltaTime += 1 / 10;
        this.updateAmplitude();
        this.updatePts();
        this.gain.gain.value = Num.normalizeValue(this.amplitude, 0, 30);
        if (this.amplitude < 1) this.reset()
    }

    reset = (): void => {
        this.gain.gain.rampTo(0,0.05);
        this.deltaTime = 0;
        this.amplitude = 0;
        this.isOscillating = false;
        console.log('reset')
    }
}

class AnimationExample extends PtsCanvas {
    private world: any;
    private dragging: boolean;
    private indicator: Pt | undefined;
    private collider: Pt;
    private strings: String[];
    private noiseGrid: any;
    private gain: any;
    private sound: Sound;

    constructor(...args) {
        super(args as any);
        this.noiseGrid = new Group();
        this.dragging = false;
        this.indicator = undefined;
        this.collider = new Pt();
        this.strings = [];
        this.gain = new Gain(1).toDestination();
        this.sound = Sound.from(this.gain, this.gain.context).analyze(512);
    }

    _create(bound, space) {
        let gd = Create.gridPts(this.space.innerBound, 20, 20);
        this.noiseGrid = gd;
        // this.noiseGrid = Create.noisePts(gd, 0.05, 0.1, 20, 20);
    }

    hasCollision(pt: Pt, line: Group, threshold: number = 3): boolean {
        const collinear = Line.collinear(line.p1, line.q1, pt, threshold);
        const perpPt = Line.perpendicularFromPt(line, pt);
        const intersect = Line.intersectLine2D([pt, perpPt], line);

        return !!(collinear && intersect);  // return true if both collinear and intersect
    }

    // Override PtsCanvas' start function
    start(space, bound) {
        this._create(space, bound);
        this.collider = new Pt(this.space.center)
    }

    // Override PtsCanvas' resize function
    resize(space, bound) {
        if (this.world) this.world.bound = space.innerBound;
    }

    action(type, x, y) {
        if (type === "down") { // clicked button
            console.log('drag')
            this.dragging = true;
            this.indicator = new Pt(x, y);
        }
        if (this.dragging) {
            if (type === "drop" || type === 'up') {
                console.log('release')
                this.dragging = false;
                const line = Group.fromPtArray([this.indicator as Pt, new Pt(x, y)])
                if (Line.magnitude(line) > 100) {  // discard lines with magnitude < 100
                    const intpt1 = line.interpolate(0.33);
                    const intpt2 = line.interpolate(0.66);
                    const string = new Group(line[0], intpt1, intpt2, line[1]);
                    this.strings.push(new String(string, this.gain));
                }
                this.indicator = undefined;
            }
        }
    }

    // Override PtsCanvas' animate function
    animate(time, ftime) {
        // analyze sound
        let td = this.sound.freqDomainTo( this.space.size );
        // this.form.line( td ); // visualize as points

        // noise background
        this.noiseGrid.forEach((p, i) => {
            // p.step(0.01, 0.01);
            this.form.fillOnly(Color.hsb(i%360,100,255).hex).point(p, Math.abs(15 * Num.normalizeValue(td[i].y, 0, this.space.size.x)), "circle");
        });

        // collider
        this.collider.x = Math.cos(time / 600) * 400 + this.space.center.x;
        this.form.fillOnly('#fff').point(this.collider, 5, 'circle')

        // loop through each string
        this.strings.forEach(string => {
            this.form.fillOnly('fff').points(string.line, 3, 'circle');
            this.form.strokeOnly('#fff', 0.3).line(string.curve);
            const collide = this.hasCollision(this.collider, string.line, 5);
            if (string.isOscillating) {
                string.update()
            } else if (collide) {
                string.trigger()
            }
        })



        // draw the mouse indicator line
        if (this.indicator) {
            // this.temp.rotate2D(Const.one_degree / 10, this.space.center)
            this.form.stroke('#fff', 1, 'round', 'round').line([this.indicator, this.space.pointer])
        }

        // draw a center point
        this.form.fillOnly('#f00').point(this.space.center, 3, 'circle')
    }
}

const HTML5Canvas = ({...props}) => {
    console.log('canvas render')
    return (
        <StyledCanvas as={AnimationExample} background={'#123'} name={'points'}>

        </StyledCanvas>
    )
}

export default HTML5Canvas
