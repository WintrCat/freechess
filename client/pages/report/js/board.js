/**
 * @type {CanvasRenderingContext2D}
 */
const ctx = document.querySelector("#board").getContext("2d");

function drawBoard() {
    let colours = ["#f6dfc0", "#b88767"];

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            ctx.fillStyle = colours[(x + y) % 2];

            ctx.fillRect(x * 90, y * 90, 90, 90);
        }
    }
}

function drawPieces(fen) {
    
}

drawBoard();