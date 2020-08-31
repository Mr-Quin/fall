import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { debounce } from "lodash";
import StringBase from "../models/StringBase";
import { useMood } from "./Mood";
import { randomFromArray } from "../utils/utils";
import { StyledPath, StyledCircle } from "../styles/Path";
import { Point } from "../Types";


interface StingProps {
    string: StringBase,
    startPoint?: Point,
    endPoint?: Point,
    partial?: boolean,
    color?: string | number
}

const String: React.FunctionComponent<StingProps> = ({string, color, ...props}) => {   // takes a String prop and renders it
    const colorRef = useRef<any>(color || Math.random() * 360);
    color = colorRef.current;
    const [points, setPoints] = useState<any>(string.getPoints());
    const {keys} = useMood();
    const {startPoint, oscPoint, endPoint} = points;

    useEffect(() => {
        string.setOnUpdate(() => {
            setPoints(string.getPoints())
        })
    }, [string])

    // useEffect(() => {
    //     string.setFreq(randomFromArray(keys as Array<string>))
    // }, [string, keys])

    const handleHover = useCallback(debounce((e) => {   //throttled
        string.trigger(randomFromArray(keys as Array<string>));
    }, 1000, {leading: true, trailing: false, maxWait: 1000}), [string]);

    return (
        <PartialString startPoint={startPoint} endPoint={endPoint} midPoint={oscPoint} color={color}
                       onMouseOver={handleHover}/>
    );
};

interface PartialStringProps {
    startPoint: Point,
    endPoint: Point,
    midPoint?: Point,
    color?: string | number,

    [others: string]: any,
}

const PartialString: React.FunctionComponent<PartialStringProps> = ({startPoint, endPoint, midPoint, color, ...props}) => {
    return (
        <>
            <StyledCircle as={'circle'} cx={startPoint.x} cy={startPoint.y} r={5} color={color}/>
            {midPoint ? <StyledPath {...props}
                                    d={`M ${startPoint.x} ${startPoint.y} Q ${midPoint.x} ${midPoint.y} ${endPoint.x} ${endPoint.y}`}
                                    color={color} filter={'#glow'}/> :
                <StyledPath d={`M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`}
                            color={color}/>}
            <StyledCircle {...props} as={'circle'} cx={endPoint.x} cy={endPoint.y} r={5} color={color}/>.
        </>
    );
}

export { PartialString }
export default memo(String)
