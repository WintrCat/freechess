/**
 * @type {CanvasRenderingContext2D}
 */
const ctx = document.querySelector("#board").getContext("2d");

let currentMoveIndex = 0;
let boardFlipped = false;

function drawBoard(fen, flipped) {
    // Draw surface of board
    let colours = ["#f6dfc0", "#b88767"];

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            ctx.fillStyle = colours[(x + y) % 2];

            ctx.fillRect(x * 90, y * 90, 90, 90);
        }
    }

    // Draw pieces
    let fenBoard = fen.split(" ")[0];
    let x = flipped ? 7 : 0, y = x;
    
    for (let character of fenBoard) {
        if (character == "/") {
            x = flipped ? 7 : 0;
            y += flipped ? -1 : 1;
        } else if (/\d/g.test(character)) {
            x += parseInt(character) * (flipped ? -1 : 1);
        } else {
            ctx.drawImage(pieceImages[character], x * 90, y * 90, 90, 90);
            x += flipped ? -1 : 1;
        }
    }
}

function traverseMoves(moveCount) {
    let alreadyAtEndPosition = currentMoveIndex == evaluatedPositions.length - 1;

    currentMoveIndex = Math.max(
        Math.min(currentMoveIndex + moveCount, evaluatedPositions.length - 1),
        0,
    );

    drawBoard(evaluatedPositions[currentMoveIndex].fen, boardFlipped); 

    // Do not play board audio if at start or end
    if (currentMoveIndex == 0 || (alreadyAtEndPosition && moveCount > 0)) return;

    // Stop all playing board audio
    document.querySelectorAll(".sound-fx-board").forEach(boardSound => {
        boardSound.pause();
        boardSound.currentTime = 0;
    });

    // Play new audio based on move type
    let moveSan = evaluatedPositions[currentMoveIndex + (moveCount == -1)].move.san;

    if (moveSan.endsWith("#")) {
        $("#sound-fx-check").get(0).play();
        $("#sound-fx-game-end").get(0).play();
    } else if (moveSan.endsWith("+")) {
        $("#sound-fx-check").get(0).play();
    } else if (/=[QRBN]/g.test(moveSan)) {
        $("#sound-fx-promote").get(0).play();
    } else if (moveSan.includes("O-O")) {
        $("#sound-fx-castle").get(0).play();
    } else if (moveSan.includes("x")) {
        $("#sound-fx-capture").get(0).play();
    } else {
        $("#sound-fx-move").get(0).play();
    }
}

$("#back-start-move-button").on("click", () => {
    traverseMoves(-Infinity);
});

$("#back-move-button").on("click", () => {
    traverseMoves(-1);
});

$("#next-move-button").on("click", () => {
    traverseMoves(1);
});

$("#go-end-move-button").on("click", () => {
    traverseMoves(Infinity);
});

$(window).on("keydown", (event) => {
    let key = event.key;

    switch (key) {
        case "ArrowDown":
            traverseMoves(-Infinity);
            break;
        case "ArrowLeft":
            traverseMoves(-1);
            break;
        case "ArrowRight":
            traverseMoves(1);
            break;
        case "ArrowUp":
            traverseMoves(Infinity);
            break;
    }
});

$("#flip-board-button").on("click", () => {
    boardFlipped = !boardFlipped;
    drawBoard(evaluatedPositions[currentMoveIndex].fen, boardFlipped);
});