import React from 'react';
import styled from 'styled-components'
import { Pt, Group, Particle, Create, Curve, Line, Sound, Const, Form, Num } from 'pts'
import { QuickStartCanvas, PtsCanvas } from 'react-pts-canvas'
import { Synth } from "tone";

const StyledCanvas = styled.div`
    width: 100%;
    height: 100%;
`

class AnimationExample extends PtsCanvas {
    private noiseGrid: any;
    private world: any;
    private pts: any;
    private synths: any;
    private click: number;
    private dragging: boolean;
    private temp: any;
    private collider: Pt;
    private amplitude: number;
    private dampening: number;
    private angularFrequency: number;
    private oscillating: boolean;
    private deltaTime: number;

    constructor(...args) {
        super(args as any);
        this.click = 0;
        this.pts = new Group();
        this.synths = [];
        this.dragging = false;
        this.temp = undefined;
        this.collider = new Pt();
        this.amplitude = 0;
        this.dampening = 1 / Math.E / 20;
        this.angularFrequency = 2 * Math.PI * 4;
        this.oscillating = false;
        this.deltaTime = 0;
    }

    _create(bound, space) {
        // let r = space.size.minValue().value / 2;
        //
        // // create 200 lines
        // for (let i = 0; i < 20; i++) {
        //     let ln = new Group(Pt.make(2, r, true), Pt.make(2, -r, true));
        //     ln.moveBy(space.center).rotate2D(i * Math.PI / 200, space.center);
        //     this.pairs.push(ln);
        //     this.synths.push(new Synth().toDestination());
        // }
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
            this.temp = new Pt(x, y);
        }
        if (this.dragging) {
            if (type === "drop" || type === 'up') {
                console.log('release')
                this.dragging = false;
                this.click += 1;
                const line = Group.fromPtArray([this.temp, new Pt(x, y)])
                if (Line.magnitude(line) > 100) {  // discard lines with magnitude < 100
                    const intpt1 = line.interpolate(0.33);
                    const intpt2 = line.interpolate(0.66);
                    this.pts.push(...[line[0], intpt1, intpt2, line[1]]);
                }
                this.temp = undefined;
            }
        }
    }

    // Override PtsCanvas' animate function
    animate(time, ftime) {
        // collider
        this.collider.x = Math.cos(time / 300) * 400 + this.space.center.x;
        this.form.fillOnly('#fff').point(this.collider, 5, 'circle')

        // rotate each pt around center
        this.pts.forEach(pt => {
            pt.rotate2D(Const.one_degree / 10, this.space.center);
        })

        let lines = this.pts.segments(4, 4);
        let perpPoint;
        lines.forEach(line => {
            line = Group.fromPtArray(line); // convert line to group
            let straitLine = new Group(line.p1, line.q1)    // gets the straight line
            let newP2, newQ2;
            // line.p2.rotate2D(Const.one_degree / 10, line.p1)
            // line.q2.rotate2D(Const.one_degree / -10, line.q1)
            perpPoint = Line.perpendicularFromPt(straitLine, this.collider)
            let collinear = Line.collinear(straitLine.p1, straitLine.q1, this.collider, 3);
            if (collinear && !this.oscillating) {
                this.amplitude = 50;
                this.deltaTime = 0;
                this.oscillating = true;
            }
            if (this.amplitude > 0) {
                this.deltaTime += 1 / 10;
                this.amplitude = this.amplitude * Math.exp(-this.dampening * this.deltaTime);
                const displacement = this.amplitude * Math.cos(this.deltaTime * this.angularFrequency);     // A cos(ωt)    displacement
                const angle = Math.atan(Line.slope(line.p1, line.q1));
                newP2 = line.p2.$add(-displacement * Math.sin(angle), displacement * Math.cos(angle));
                newQ2 = line.q2.$add(-displacement * Math.sin(angle), displacement * Math.cos(angle));
                if (this.amplitude < 1) {
                    this.amplitude = 0;
                    this.oscillating = false;
                }
            }
            if (newP2) {
                this.form.points([straitLine.p1, newP2, newQ2, straitLine.q1], 2, 'circle')
                this.form.strokeOnly('#fff', 3).line(Curve.bezier([straitLine.p1, newP2, newQ2, straitLine.q1]));
            } else {
                this.form.strokeOnly(`#fff`, 3).line(straitLine);
            }
            this.form.strokeOnly(`${collinear ? '#f00' : '#fff'}`, 1).line(straitLine);
        })

        // draw the mouse indicator line
        if (this.temp) {
            // this.temp.rotate2D(Const.one_degree / 10, this.space.center)
            this.form.stroke('#fff', 3, 'round', 'round').line([this.temp, this.space.pointer])
        }

        // draw a center point
        this.form.fillOnly('#f00').point(this.space.center)
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
