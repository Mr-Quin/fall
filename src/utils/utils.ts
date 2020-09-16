import { Point } from '../models/Types'

export const distPoint = (pt1: Point, pt2: Point) => {
    const a = Math.pow(pt1.x - pt2.x, 2)
    const b = Math.pow(pt1.y - pt2.y, 2)
    return Math.sqrt(a + b)
}

export const midPoint = (pt1: Point, pt2: Point): Point => {
    return {
        x: (pt1.x + pt2.x) / 2,
        y: (pt1.y + pt2.y) / 2,
    }
}

export const randomFromArray = (arr: any[]): any => {
    return arr[(Math.random() * arr.length) << 0]
}

export const randomBetween = (min: number, max: number): number => {
    return Math.random() * (max - min) + min
}

export const mapValue: (...args: any[]) => number = (value, low1, high1, low2, high2) => {
    if (value > high1) {
        return high2
    }
    return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1)
}

export const chunk = (array: any[], size: number): any[] => {
    let index: number = 0
    const arrayLength: number = array.length
    const tempArray: any[] = []

    for (index = 0; index < arrayLength; index += size) {
        const chunk = array.slice(index, index + size)
        tempArray.push(chunk)
    }

    return tempArray
}

// b-v color to kelvin
export const bvToK = (ci: number): number => {
    return 4600 * (1 / (0.92 * ci + 1.7) + 1 / (0.92 * ci + 0.62))
}

export const kToRGB = (kelvin: number): number[] => {
    const temp = kelvin / 100

    let red, green, blue

    if (temp <= 66) {
        red = 255

        green = temp
        green = 99.4708025861 * Math.log(green) - 161.1195681661

        if (temp <= 19) {
            blue = 0
        } else {
            blue = temp - 10
            blue = 138.5177312231 * Math.log(blue) - 305.0447927307
        }
    } else {
        red = temp - 60
        red = 329.698727446 * Math.pow(red, -0.1332047592)

        green = temp - 60
        green = 288.1221695283 * Math.pow(green, -0.0755148492)

        blue = 255
    }

    return [clamp(red, 0, 255), clamp(green, 0, 255), clamp(blue, 0, 255)]
}

export const clamp = (x: number, min: number, max: number): number => {
    if (x < min) {
        return min
    }
    if (x > max) {
        return max
    }

    return x
}

export const lerp = (v0: number, v1: number, t: number): number => {
    return v0 * (1 - t) + v1 * t
}

export const normalizeValue = (val, max, min) => {
    return (val - min) / (max - min)
}
