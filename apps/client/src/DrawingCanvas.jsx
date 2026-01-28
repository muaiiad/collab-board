import { useEffect, useLayoutEffect, useState } from "react";
import { useRef } from "react";

function resize(canvas, ctx) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    // Reset transform each resize then scale for DPR.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    // Set drawing style (in CSS pixels).
    // ctx.lineWidth = 3;
    // ctx.lineCap = "round";
    // ctx.lineJoin = "round";
    // ctx.strokeStyle = "#111";
}

function DrawingCanvas({ tool, color }) {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const drawingRef = useRef(false);
    const lastPointRef = useRef({ x: 0, y: 0 });
    const [strokes, setStrokes] = useState([]);
    const currentStroke = useRef(null);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctxRef.current = ctx;

        resize(canvas, ctx);
    }, []);

    useEffect(() => {
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;
        ctxRef.current = ctx;
        if (tool === "brush") {
            ctx.lineWidth = 3;
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.strokeStyle = color;
        } else if (tool === "eraser") {
            ctx.lineWidth = 50;
            ctx.lineCap = "square";
            ctx.lineJoin = "square";
            ctx.strokeStyle = "#fff";
        }
    }, [tool, color]);

    useEffect(() => {
        console.log("strokes updated:", strokes);
    }, [strokes]);

    
    function getPoint(e) {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
    }

    function start(e) {
        const ctx = ctxRef.current;
        if (!ctx) return;
       

        canvasRef.current.setPointerCapture(e.pointerId);
        const p = getPoint(e);
        drawingRef.current = true;
        lastPointRef.current = p;
        const strk = {
            id: Date.now(),
            tool: tool,
            color: ctx.strokeStyle,
            width: ctx.lineWidth,
            points: [p],
        }
        currentStroke.current = strk;

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
    }

    function move(e) {
        if (!drawingRef.current) return;
        if (!currentStroke.current) return

        const ctx = ctxRef.current;
        if (!ctx) return;

        const p = getPoint(e);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        currentStroke.current.points.push(p);

        lastPointRef.current = p;
    }

    function end(e) {
        canvasRef.current.releasePointerCapture(e.pointerId);
        if (currentStroke.current) {
            const stroke = currentStroke.current;
            setStrokes((prev) => [...prev, stroke]);
            currentStroke.current = null;
        }
        drawingRef.current = false;
    }

    return (
        <canvas
            ref={canvasRef}
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
            style={{ touchAction: "none" }}
            className="w-screen h-screen cursor-crosshair"
        />
    );
}

export default DrawingCanvas;
