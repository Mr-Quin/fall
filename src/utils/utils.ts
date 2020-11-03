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
