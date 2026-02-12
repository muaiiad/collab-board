export async function getBoard(boardId) {
    const board = await fetch(`http://localhost:3000/test/${boardId}`);
    const data = await board.json();
    return data;
}
