export default function canvasReducer(state, action) {
    switch (action.type) {
        case "add-stroke":
            console.log(state.strokes);
            return {
                strokes: [...state.strokes, action.stroke],
                redoStack: [],
                lastAction: "add-stroke"
            };
        case "set-strokes":
            return {
                strokes: action.strokes,
                redoStack: [],
                lastAction: "set-strokes"
            };
        case "undo": {
            if (state.strokes.length === 0) return state;
            const nextStrokes = state.strokes.slice(0, -1);
            const undone = state.strokes[state.strokes.length - 1];
            return {
                strokes: nextStrokes,
                redoStack: [undone, ...state.redoStack],
                lastAction: "undo"
            };
        }
        case "redo": {
            if (state.redoStack.length === 0) return state;
            const [restored, ...remaining] = state.redoStack;
            return {
                strokes: [...state.strokes, restored],
                redoStack: remaining,
                lastAction: "redo"
            };
        }
        case "clear":
            return {
                strokes: [],
                redoStack: [],
                lastAction: null
            };
        default:
            return state;
    }
}
