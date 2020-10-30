export const randomFromArray = (arr: any[]): any => {
    return arr[(Math.random() * arr.length) << 0]
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
    if (x < min) {
        return min
    } else if (x > max) {
        return max
    } else return x
}

export const lerp = (v0: number, v1: number, t: number): number => {
    return v0 * (1 - t) + v1 * t
}

export const normalize = (val: number, max: number, min: number): number => {
    return (val - min) / (max - min)
}
