import React, { useEffect, useState } from 'react';
import { StyledCircle } from "../styles/Path";
import RaindropBase from "../models/RaindropBase";
import { useMood } from "./Mood";

interface RaindropProps {

}

const Raindrop = ({stringRef, ...props}) => {
    const [position, setPosition] = useState({x: 0, y: 0});
    const [raindrop, setRaindrop] = useState();

    const {keys} = useMood();

    useEffect(() => {
        if (raindrop && keys) {
            raindrop.onUpdate = () => {
                setPosition(raindrop.getPosition())
            }
            raindrop.notes = keys;
            raindrop.stringRef = stringRef;
            raindrop.fall()
        }
    }, [raindrop]);

    useEffect(() => {
        setRaindrop(new RaindropBase({x: window.innerWidth / 2, y: 0}))
    }, [keys])

    // detect collision with Strings and trigger them on collision
    return (
        <StyledCircle as={'circle'} cx={position.x} cy={position.y} r={5}/>
    )
}

export default Raindrop;
