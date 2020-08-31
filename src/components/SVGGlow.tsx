import React from 'react';

const SVGGlow: React.FunctionComponent<any> = ({...props}) => {
    return (
        <defs>
            <filter id="glow" filterUnits="userSpaceOnUse" height="100%" width="100%" x="0%" y="0%">
                <feMorphology
                    operator="dilate"
                    radius="4"
                    in="SourceAlpha"
                    result="thicken"
                />
                <feGaussianBlur in="thicken" stdDeviation="10" result="blurred"/>
                <feFlood floodColor="#cccccc" result="glowColor"/>
                <feComposite
                    in="glowColor"
                    in2="blurred"
                    operator="in"
                    result="softGlow_colored"
                />
                <feMerge>
                    <feMergeNode in="softGlow_colored"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
    )
}

export default SVGGlow;
