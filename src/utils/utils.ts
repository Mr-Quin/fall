/**
 *
 * @param array     The array to pick from
 * @param compare   Optional comparison function. The array will be filtered using this function and a random element will be returned from the filtered array.
 * @returns         A random element from the array.
 */
export const randomFromArray = <T>(array: T[], compare?: (element: T) => boolean): T => {
    if (compare !== undefined) {
        array = array.filter(compare)
    }
    if (!array.length)
        throw new Error('Array is empty or comparison function returns an empty array.')

    return array[(Math.random() * array.length) << 0]
}

/**
 * Generates a random number within a range
 * @param {number} min The lower bound of the range, included
 * @param {number} max The upper bound of the range, not included
 * @param {boolean} floor Optional. When set to true, an integer will be returned. This is the same as calling Math.floor() on the outcome.
 * @returns {number} A random number from within the given range
 */
export const randomRange = (min: number, max: number, floor?: boolean): number => {
    const num = Math.random() * (max - min) + min
    return floor ? num << 0 : num
}

export const mapValue = (
    value: number,
    low1: number,
    high1: number,
    low2: number,
    high2: number
): number => {
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
    // supposed if else statement is faster?
    const d = x < min ? min : x
    return d > max ? max : d
}

export const lerp = (v0: number, v1: number, t: number): number => {
    return v0 * (1 - t) + v1 * t
}

export const normalize = (val: number, max: number, min: number): number => {
    return (val - min) / (max - min)
}

export const getValidNote = (note: number, minNote: number): number => {
    // midi number from 21 - 108
    // transpose notes below minNote to above minNote
    if (note < minNote) {
        const diff = minNote - note
        return note + (Math.floor(diff / 12) + 1) * 12
    }
    return note
}

// https://www.febucci.com/2018/08/easing-functions/
export const flip = (x: number): number => 1 - x

export const easeInQuadratic = (t: number): number => t ** 2

export const easeOutQuadratic = (t: number): number => flip(easeInQuadratic(flip(t)))

export const easeInOutQuadratic = (t: number): number =>
    lerp(easeInQuadratic(t), easeOutQuadratic(t), t)

export const easeInOutCubic = (t: number): number =>
    t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2

/**
 *
 * @param radius radius
 * @param z z position, assuming z is the up axis
 * @returns {number} latitude in radians
 */
export const latitude = (radius: number, z: number): number => Math.asin(z / radius)

export const longitude = (x: number, y: number): number => Math.atan2(x, y)
