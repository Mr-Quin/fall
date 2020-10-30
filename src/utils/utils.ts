/**
 *
 * @param array     The array to pick from
 * @param compare   Optional comparison value. The return value will be different from this value.
 *                  If no element in the array has a different value, an error will be thrown.
 * @returns         A random element from the array.
 */
export const randomFromArray = <T>(array: T[], compare?: T): T => {
    if (compare !== undefined) {
        if (!array.some((elt) => elt !== compare))
            throw new Error('Array does not contain elements that differs from compare')

        let value = array[(Math.random() * array.length) << 0]
        while (Object.is(value, compare)) {
            value = array[(Math.random() * array.length) << 0]
        }
        return value
    }
    return array[(Math.random() * array.length) << 0]
}

export const randomRange = (min: number, max: number, asInt?: boolean): number => {
    const num = Math.random() * (max - min) + min
    return asInt ? num << 0 : num
}

export const mapValue: (...args: any[]) => number = (value, low1, high1, low2, high2) => {
    if (value > high1) {
        return high2
    }
    return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1)
}

export const chunk = <T>(array: T[], size: number): T[][] => {
    let i = 0
    const arrayLength = array.length
    const tempArray: T[][] = []

    for (i = 0; i < arrayLength; i += size) {
        const chunk = array.slice(i, i + size)
        tempArray.push(chunk)
    }

    return tempArray
}

export const clamp = (x: number, min: number, max: number): number => {
    const d = x < min ? min : x
    return d > max ? max : d
}

export const lerp = (v0: number, v1: number, t: number): number => {
    return v0 * (1 - t) + v1 * t
}

export const normalize = (val: number, max: number, min: number): number => {
    return (val - min) / (max - min)
}
