import { io } from "socket.io-client";
import { useEffect, useRef } from "react";

export default function useSocket(url) {
    const socketRef = useRef(null)
    

    useEffect(() => {
        socketRef.current = io(url);

        return () => {
            socketRef.current.disconnect();
        };
    }, [url]);

    return socketRef;
}