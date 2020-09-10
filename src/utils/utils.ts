import { Point } from '../Types'

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

export const lerp = (v0: number, v1: number, t: number): number => {
    return v0 * (1 - t) + v1 * t
}
