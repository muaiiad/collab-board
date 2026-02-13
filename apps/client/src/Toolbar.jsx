function Toolbar({ tool, setTool, color, setColor, onShare }) {
    function chooseBrush() {
        setTool("brush");
    }
    function chooseEraser() {
        setTool("eraser");
    }

    return (
        <div className="fixed inset-x-0 top-4 flex justify-center">
            <div className="inline-flex items-start gap-2">
                <div className="inline-flex items-center gap-3 rounded-lg bg-gray-100/80 p-2 backdrop-blur">
                {/* Tools */}
                <div className="inline-flex overflow-hidden rounded-md border border-gray-200">
                    <button
                        onClick={chooseBrush}
                        type="button"
                        className={`h-10 w-10 text-xs ${
                            tool === "brush" ? "bg-gray-200" : "bg-gray-100"
                        } hover:bg-gray-200 border-0 cursor-pointer`}
                    >
                        Brush
                    </button>
                    <button
                        onClick={chooseEraser}
                        type="button"
                        className={`h-10 w-10 text-xs ${
                            tool === "eraser" ? "bg-gray-200" : "bg-gray-100"
                        } hover:bg-gray-200 border-0 cursor-pointer`}
                    >
                        Eraser
                    </button>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-gray-300" />

                {/* Color picker (4x2) */}
                <div className="grid grid-cols-4 gap-1">
                    {[
                        "#111827",
                        "#EF4444",
                        "#F59E0B",
                        "#10B981",
                        "#3B82F6",
                        "#8B5CF6",
                        "#EC4899",
                        "#FFFFFF",
                    ].map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => setColor(c)}
                            className={`h-6 w-6 rounded-sm border cursor-pointer ${
                                color === c
                                    ? "border-gray-900 ring-1 ring-gray-900"
                                    : "border-gray-300 hover:border-gray-500"
                            }`}
                            style={{ backgroundColor: c }}
                            aria-label={`Select color ${c}`}
                            title={c}
                        />
                    ))}
                </div>
                </div>
            </div>
        </div>
    );
}

export default Toolbar;
