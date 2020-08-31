import { Point } from "../Types";

export const distPoint = (pt1: Point, pt2: Point) => {
    const a = Math.pow(pt1.x - pt2.x, 2);
    const b = Math.pow(pt1.y - pt2.y, 2);
    return Math.sqrt(a + b);
}

export const midPoint = (pt1: Point, pt2: Point): Point => {
    return {
        x: (pt1.x + pt2.x) / 2,
        y: (pt1.y + pt2.y) / 2
    }
}

export const randomFromArray = (arr: Array<any>): any => {
    const randomIndex = Math.random() * arr.length << 0;
    return arr[randomIndex];
}

export const mapValue: (...args: Array<number>) => number = (value, low1, high1, low2, high2, ceil) => {
    if (ceil && value > high1) {
        return high2
    }
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
};
