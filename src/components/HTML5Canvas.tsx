import React from 'react'
import styled from 'styled-components'
import { Pt, Group, Create, Line, Sound, Num, Geom, Rectangle, Bound, Circle, Color } from 'pts'
import { PtsCanvas } from 'react-pts-canvas'
import { MoodContext } from './Mood'
import { mapValue, randomFromArray } from '../utils/utils'
import { JCReverb, Compressor, Gain, Freeverb } from 'tone'
import Chord from '../models/Chord'

const StyledCanvas = styled.div`
    width: 100%;
    height: 100%;
`

class AnimationExample extends PtsCanvas {
    private world: any
    private dragging: boolean
    private indicator: Pt | undefined
    private colliders: any
    private strings: Chord[]
    private starField: Group
    private readonly compressor: any
    private readonly gain: Gain
    private readonly reverb: Freeverb
    private sound: Sound
    static contextType = MoodContext
    private min: number

    constructor(...args) {
        super(args as any)
        this.starField = new Group()
        this.min = 0
        this.dragging = false
        this.indicator = undefined
        this.colliders = new Group()
        this.strings = []
        this.compressor = new Compressor(-30, 3).toDestination()
        this.reverb = new Freeverb({ roomSize: 0.85, dampening: 600 }).connect(this.compressor)
        this.gain = new Gain(0.5).connect(this.reverb)
        this.sound = Sound.from(this.compressor, this.compressor.context).analyze(512, -100, -10)
    }

    _create(bound, space) {
        const diag = Line.magnitude([
            this.space.innerBound.bottomRight,
            this.space.innerBound.topLeft,
        ])
        const diagRect = Rectangle.fromCenter(this.space.center, diag)
        const diagBound = Bound.fromGroup(diagRect)
        this.starField = Create.distributeRandom(diagBound, 512)
        this.min = this.space.size.minValue().value
    }

    collides(pt: Pt, line: Group, threshold: number = 3): boolean {
        const collinear = Line.collinear(line.p1, line.q1, pt, threshold)
        const perpendicularPt = Line.perpendicularFromPt(line, pt)
        const intersect = Line.intersectLine2D([pt, perpendicularPt], line)

        return !!(collinear && intersect) // return true if both collinear and intersect
    }

    // Override PtsCanvas' start function
    start(space, bound) {
        this._create(space, bound)
    }

    // Override PtsCanvas' resize function
    resize(space, bound) {
        if (this.world) this.world.bound = space.innerBound
    }

    action(type, x, y) {
        if (type === 'down') {
            // clicked button
            console.log('drag')
            this.dragging = true
            this.indicator = new Pt(x, y)
        }
        if (this.dragging) {
            if (type === 'drop' || type === 'up') {
                console.log('release')
                this.dragging = false
                const line = Group.fromPtArray([this.indicator as Pt, new Pt(x, y)])
                if (Line.magnitude(line) > 100) {
                    const intpt1 = line.interpolate(1 / 3)
                    const intpt2 = line.interpolate(2 / 3)
                    const chord = new Group(line[0], intpt1, intpt2, line[1])
                    this.strings.push(new Chord(chord, this.gain))
                }
                this.indicator = undefined
            }
        }
    }

    // Override PtsCanvas' animate function
    animate(time, ftime): void {
        // TODO: put things into their own class and call their render method
        // Gradient background
        let radial = this.form.gradient(['#051427', '#000'])
        this.form
            .fill(
                radial(
                    Circle.fromCenter(this.space.center, this.min / 5),
                    Circle.fromCenter(this.space.center, this.min)
                )
            )
            .rect(this.space.innerBound)

        // analyze sound
        const td = this.sound.freqDomainTo(this.space.size)
        // this.form.stroke('#fff').line(td) // visualize as points

        // starfield background
        // const filter = new Group()
        this.starField.forEach((p, i, arr) => {
            p.rotate2D(
                Num.mapToRange(i, 0, this.starField.length, 0.5, 1) * 0.0005,
                this.space.center
            )
            // if (td[i].y > this.space.width / 1.5) filter.push(p)
            this.form
                // .fillOnly(`rgba(255,255,255, ${Num.mapToRange(i % 16, 0, 15, 0.6, 1)})`)
                .fillOnly(['#9aeadd', '#cbe58e', '#f8bc04', '#e9e8ee'][i % 4])
                .point(
                    p,
                    Math.abs(
                        Math.random() +
                            6 * Num.normalizeValue(td[i % 256].y, 0, this.space.height / 1.2)
                    ),
                    'circle'
                )
        })
        // this.form.strokeOnly('fff', 0.05).lines(filter.segments(3, 3))

        // colliders
        let minRect = Rectangle.fromCenter(this.space.center, this.min)
        let sides = Group.fromArray([
            [minRect.p1.x, this.space.center.y],
            [minRect.p2.x, this.space.center.y],
            [this.space.center.x, minRect.p1.y],
            [this.space.center.x, minRect.p2.y],
        ])
        let cycle = (t, i) =>
            Num.cycle(
                (i * (16 / (this.context.bpm / 60) / 4) + t / 1000) / (16 / (this.context.bpm / 60))
            )
        this.colliders = sides.segments(2, 2).map((line, i) => {
            this.form.strokeOnly('fff', 0.1).line(line)
            let pt = Geom.interpolate(line[0], line[1], cycle(time, i))
            this.form.fillOnly('#fff').point(pt, 5, 'circle')
            return pt
        })

        // tempo lines
        for (let i = 3; i < 13; i++) {
            this.form
                .strokeOnly('fff', i % 3 === 0 ? 0.3 : 0.1)
                .point(this.space.center, (this.min / 2) * Math.cos((Math.PI * i) / 24), 'circle')
        }

        // loop through each string
        this.strings.forEach((string) => {
            // string.pts.rotate2D(0.001, this.space.center)
            this.form.fillOnly('fff').points(string.line, 3, 'circle')
            this.form.strokeOnly('#fff', 0.3).line(string.curve)
            this.colliders.forEach((collider) => {
                const collide = this.collides(collider, string.line, 4)
                if (string.canTrigger && collide) {
                    string.trigger(randomFromArray(this.context.keys))
                }
            })
            if (string.isOscillating) {
                string.update()
            }
        })

        // draw the mouse indicator line and octave number
        if (this.dragging) {
            const lineMagnitude = Line.magnitude(
                new Group(this.indicator as Pt, this.space.pointer)
            )
            this.form.text(
                this.space.pointer.$add(20, 20),
                (mapValue(lineMagnitude, 100, 1200, 8, 0) << 0).toString()
            )
            this.form.stroke('#fff', 1, 'round', 'round').line([this.indicator, this.space.pointer])
        }

        // draw a center point
        this.form.fillOnly('#fff').point(this.space.center, 3, 'circle')
    }
}

const HTML5Canvas = ({ ...props }) => {
    console.log('canvas render')
    return <StyledCanvas as={AnimationExample} background={'#010b19'} name={'points'} />
}

export default HTML5Canvas
