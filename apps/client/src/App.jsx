import Toolbar from "./Toolbar";
import DrawingCanvas from "./DrawingCanvas";
import { useState } from "react";

function App() {
    const [tool, setTool] = useState("brush");
    const [color,setColor] = useState("#111827");



    return (
        <>
            <Toolbar tool={tool} setTool={setTool} color={color} setColor={setColor} />
            <DrawingCanvas tool={tool} color={color} />
        </>
    );
}

export default App;
