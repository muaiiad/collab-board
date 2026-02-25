import { useEffect, useLayoutEffect,useRef } from "react";

function resize(canvas, ctx) {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // Reset transform each resize then scale for DPR.

}

export default function DrawingCanvas({ canvasState, dispatch , tool, color, socket, boardId }) {
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const drawingRef = useRef(false);
    const lastPointRef = useRef({ x: 0, y: 0 });
    const currentStroke = useRef(null);
    const strokesRef = useRef(canvasState.strokes);
    const timerRef = useRef(null);
    const currentBatch = useRef({ strokeId: null, points: [] });

    function flushBatch() {
        if (!currentBatch.current.strokeId) return;
        if (currentBatch.current.points.length === 0) return;
        console.log("flushing batch");
        socket.current.emit("stroke-batch", {
            points: currentBatch.current.points,
            strokeId: currentBatch.current.strokeId,
            boardId,
        });

        currentBatch.current.points = [];
    }

    function startFlushLoop() {
        if (timerRef.current != null) return;
        
        timerRef.current = setInterval(() => {
            if (!drawingRef.current) return;
            flushBatch();
        }, 20);
    }
    
    function stopFlushLoop() {
        // final flush so last points aren’t stuck
        flushBatch();

        if (timerRef.current != null) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    }



    useEffect(() => {
        strokesRef.current = canvasState.strokes;
    }, [canvasState.strokes]);


    function applyTool(ctx) {
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
    }
    useEffect(() => {
        const ctx = canvasRef.current.getContext("2d");
        if (!ctx) return;
        ctxRef.current = ctx;
        applyTool(ctx);
    }, [tool, color]);

    useEffect(() => {
        function onKeyDown(e) {
            const target = e.target;
            const tagName = target && target.tagName ? target.tagName.toLowerCase() : "";
            if (tagName === "input" || tagName === "textarea" || target?.isContentEditable) {
                return;
            }

            const isMod = e.ctrlKey || e.metaKey;
            if (!isMod) return;

            const key = e.key.toLowerCase();
            if (key === "z") {
                e.preventDefault();
                dispatch({ type: "undo" });
                return;
            }

            if (key === "y") {
                e.preventDefault();
                dispatch({ type: "redo" });
            }
        }

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);


    function clearCanvas() {
        const canvas = canvasRef.current;
        const ctx = ctxRef.current;
        if (!canvas || !ctx) return;
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, rect.width, rect.height);
    }

    function draw() {
        const ctx = ctxRef.current;
        if (!ctx) return;

        Object.entries(strokesRef.current).forEach(([id,stroke]) => {
            ctx.beginPath();
         
            ctx.lineWidth = stroke.width;
            ctx.strokeStyle = stroke.color;
            ctx.lineCap = stroke.tool === "brush" ? "round" : "square";
            ctx.lineJoin = stroke.tool === "brush" ? "round" : "square";
            const points = stroke.points;
            if (points.length > 0) {
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                ctx.stroke();
            }
        });
    }

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctxRef.current = ctx;
        const ro = new ResizeObserver(() => {
            resize(canvas, ctx);
            applyTool(ctx);
            clearCanvas();
            draw();
        });
        resize(canvas, ctx);
        clearCanvas();
        draw();

        ro.observe(canvas);

        return () => ro.disconnect();
        
    }, []);

    useEffect(() => {
        if (!canvasState.lastAction || !boardId) return;
        if (canvasState.lastAction.type === "undo") {
            socket.current.emit("delete-stroke", { id: canvasState.lastAction.id, boardId });
        } else if (canvasState.lastAction.type === "redo") {
            socket.current.emit("add-stroke", { stroke: canvasState.lastAction.stroke, boardId });
        }

    }, [canvasState.lastAction]);


    useEffect(() => {
        if (!canvasState.lastAction) return;
        if (canvasState.lastAction.type === "redo" ||
            canvasState.lastAction.type === "undo" ||
            canvasState.lastAction.type === "set-strokes" ||
            canvasState.lastAction.type === "delete-stroke") {
            clearCanvas();
            draw();
        }
    }, [canvasState.strokes]);   
    
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
            id: crypto.randomUUID(),
            tool: tool,
            color: ctx.strokeStyle,
            width: ctx.lineWidth,
            points: [p],
        }
        currentStroke.current = strk;
        currentBatch.current.strokeId = strk.id;
        currentBatch.current.points = [p];
        startFlushLoop();

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
        currentBatch.current.points.push(p);

        lastPointRef.current = p;
    }

    function end(e) {
        canvasRef.current.releasePointerCapture(e.pointerId);
        if (currentStroke.current){
            const stroke = currentStroke.current;
            dispatch({ type: "add-stroke", stroke });
            socket.current.emit("add-stroke", { stroke, boardId });
            currentStroke.current = null;
        }
        stopFlushLoop();
        drawingRef.current = false;
    }

    return (
        <>
            <canvas
                ref={canvasRef}
                onPointerDown={start}
                onPointerMove={move}
                onPointerUp={end}
                onPointerLeave={end}
                style={{ touchAction: "none" }}
                className="w-screen h-screen cursor-crosshair"
            />
        </>
    );
}
