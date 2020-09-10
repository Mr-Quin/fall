import { useLayoutEffect, useRef } from "react";

const useAnimation: (callback: () => void) => void = (callback) => {
    const callbackRef = useRef<() => void>();
    callbackRef.current = callback;
    const frameRef = useRef<number>(0);
    callbackRef.current = () => {
        callback();
        frameRef.current = requestAnimationFrame(callbackRef.current as FrameRequestCallback);
    };

    useLayoutEffect(() => {
        frameRef.current = requestAnimationFrame(callbackRef.current as FrameRequestCallback);
        return () => {
            window.cancelAnimationFrame(frameRef.current);
        };
    }, [callbackRef]);
}

export default useAnimation;
