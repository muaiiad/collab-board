import removeKey from "../helpers/removeKey";
export default function canvasReducer(state, action) {
    switch (action.type) {
        case "add-stroke":
            // console.log(state.strokes);
            
            return {
                strokes: {...state.strokes, [action.stroke.id]: action.stroke},
                undoStack: [...state.undoStack, action.stroke.id],
                redoStack: [],
                lastAction: {"type": "add-stroke", "id": action.stroke.id}
            };
        case "set-strokes":
            return {
                ...state,
                strokes: action.strokes,
                lastAction: {"type": "set-strokes"}
            };
        case "delete-stroke":
            return {
                ...state,
                strokes: removeKey(state.strokes, action.id),
                undoStack: state.undoStack.filter(id => id !== action.id),
                lastAction: {"type": "delete-stroke", "id": action.id}
            };
        case "undo": {
            if (state.strokes.length === 0) return state;
            const undone = state.strokes[state.undoStack[state.undoStack.length - 1]];
            if (!undone) return state;

            const newUndoStack = state.undoStack.slice(0,-1)
            return {
                ...state,                
                strokes: removeKey(state.strokes, state.undoStack[state.undoStack.length - 1] ),
                undoStack: newUndoStack,
                redoStack: [undone, ...state.redoStack],
                lastAction: {"type": "undo", "id": undone.id}
            };
        }
        case "redo": {
            if (state.redoStack.length === 0) return state;
            const [restored, ...remaining] = state.redoStack;
            return {
                ...state,
                strokes: {...state.strokes, [restored.id]: restored},
                undoStack: [...state.undoStack, restored.id],
                redoStack: remaining,
                lastAction: {"type": "redo", "stroke": restored}
            };
        }
        case "clear":
            return {
                strokes: {},
                redoStack: [],
                lastAction: null
            };
        default:
            return state;
    }
}
