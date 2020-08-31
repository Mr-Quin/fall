import React, { useEffect, useReducer, useState } from 'react';
import styled from 'styled-components'
import { v4 as uuid } from "uuid"
import String, { PartialString } from "./String";
import Raindrop from "./Raindrop";
import StringBase from "../models/StringBase";
import useMousePosition from "../hooks/useMousePosition";
import { Point } from "../Types";
import { distPoint } from "../utils/utils";
import SVGGlow from "./SVGGlow";


const CanvasStyle = styled.svg`
    width: 100%;
    height: 100%;
`

interface StringReducerAction {
    type: 'ADD' | 'REMOVE';
    payload: {
        string?: StringBase;
        id?: string;
    }
}

interface StringReducerArray {
    string: StringBase;
    id: uuid;
}

const stringsReducer = (strings: StringReducerArray[], action: StringReducerAction): StringReducerArray[] => {
    const {string} = action.payload;
    const prevState = [...strings];
    switch (action.type) {
        case 'ADD':
            const id = uuid();
            return [...prevState, {string: string, id: id}] as StringReducerArray[]
        case 'REMOVE':
            return prevState;
        default:
            return prevState;
    }
};

const Canvas = ({...props}) => {
    const [strings, stringsDispatch] = useReducer(stringsReducer, []);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [stringIsValid, setStringIsValid] = useState<boolean>(false);
    const [savedMousePos, setSavedMousePos] = useState<Point>({x: 0, y: 0});
    const mousePos: Point = useMousePosition();

    useEffect(() => {
        if (isDragging) {
            if (distPoint(mousePos, savedMousePos) > 100) {
                setStringIsValid(true)
            } else {
                setStringIsValid(false)
            }
        }
    }, [mousePos, savedMousePos, isDragging])

    const addString: (String: StringBase) => void = (String) => {
        stringsDispatch({type: 'ADD', payload: {string: String}})
    }

    const removeString: (id: string) => void = (id) => {    // TODO: implement remove string
        stringsDispatch({type: 'REMOVE', payload: {id: id}})
    }

    const onDragStart = (e) => {
        console.log('Drag Start');
        setSavedMousePos(mousePos);
        setIsDragging(true);
    }

    const onDragEnd = (e) => {
        console.log('Drag End');
        if (stringIsValid) addString(new StringBase(savedMousePos, mousePos))
        setStringIsValid(false);
        setIsDragging(false);
    }

    return (
        <CanvasStyle onMouseDown={onDragStart} onMouseUp={onDragEnd} xmlns="http://www.w3.org/2000/svg" version="1.1">
            <SVGGlow/>
            {strings.map(({string, id}) => {
                return <String string={string} key={id}/>
            })}
            <Raindrop stringRef={strings}/>
            {isDragging &&
            <PartialString startPoint={savedMousePos as Point} endPoint={mousePos}
                           color={stringIsValid ? 'lightgreen' : 'red'}/>}
        </CanvasStyle>
    )
}

export default Canvas
