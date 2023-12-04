/**
 * @type {CanvasRenderingContext2D}
 */
const ctx = document.querySelector("#board").getContext("2d");

let currentMoveIndex = 0;

function drawBoard(fen) {
    // Draw surface of board
    let colours = ["#f6dfc0", "#b88767"];

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            ctx.fillStyle = colours[(x + y) % 2];

            ctx.fillRect(x * 90, y * 90, 90, 90);
        }
    }
    
    // Draw pieces
    // rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR
    let fenBoard = fen.split(" ")[0];
    let x = 0, y = 0;

    for (let character of fenBoard) {
        if (character == "/") {
            x = 0;
            y++;
        } else if (/\d/g.test(character)) {
            x += parseInt(character);
        } else {
            ctx.drawImage(pieceImages[character], x * 90, y * 90, 90, 90);
            x++;
        }
    }
}

function traverseMoves(moveCount) {
    currentMoveIndex = Math.max(
        Math.min(currentMoveIndex + moveCount, evaluatedPositions.length - 1),
        0
    );

    drawBoard(evaluatedPositions[currentMoveIndex].fen);
}

$("#next-move-button").click(() => {
    traverseMoves(1);
});

$("#back-move-button").click(() => {
    traverseMoves(-1);
});

$("#go-end-move-button").click(() => {
    traverseMoves(Infinity);
});

$("#back-start-move-button").click(() => {
    traverseMoves(-Infinity);
});