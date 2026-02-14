export async function getBoard(boardId) {
    const board = await fetch(`http://localhost:3000/api/boards/${boardId}`);
    const data = await board.json();
    return data;
}

export async function createBoard(board) {

    const response = await fetch("http://localhost:3000/api/boards/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(board)
    });
    console.log("response from create board", response);
    return await response.json()["id"];
    
}
