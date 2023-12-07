/**
 * @type {CanvasRenderingContext2D}
 */
const ctx = document.querySelector("#board").getContext("2d");

const classificationColours = {
    "brilliant": "#1baaa6",
    "great": "#5b8baf",
    "best": "#98bc49",
    "excellent": "#98bc49",
    "good": "#97af8b",
    "inaccuracy": "#f4bf44",
    "mistake": "#e28c28",
    "blunder": "#c93230",
    "forced": "#97af8b",
    "book": "#a88764"
};

let currentMoveIndex = 0;
let boardFlipped = false;

let whitePlayer = {
    username: "White Player",
    rating: "?"
};
let blackPlayer = {
    username: "Black Player",
    rating: "?"
};

function getBoardCoordinates(square) {
    if (boardFlipped) {
        return {
            x: 7 - "abcdefgh".split("").indexOf(square.slice(0, 1)),
            y: parseInt(square.slice(1)) - 1
        }
    } else {
        return {
            x: "abcdefgh".split("").indexOf(square.slice(0, 1)),
            y: 8 - parseInt(square.slice(1))
        }
    }
}

function drawBoard(fen) {
    // Draw surface of board
    let colours = ["#f6dfc0", "#b88767"];

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            ctx.fillStyle = colours[(x + y) % 2];

            ctx.fillRect(x * 90, y * 90, 90, 90);
        }
    }

    // Extract last move information
    let lastMove = {};

    if (currentMoveIndex > 0) {
        let lastMoveUCI = evaluatedPositions[currentMoveIndex].move.uci;

        lastMove.from = getBoardCoordinates(lastMoveUCI.slice(0, 2));
        lastMove.to = getBoardCoordinates(lastMoveUCI.slice(2));
    }

    // Draw last move highlight
    if (currentMoveIndex > 0) {
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = classificationColours[evaluatedPositions[currentMoveIndex].classification];
        ctx.fillRect(lastMove.from.x * 90, lastMove.from.y * 90, 90, 90);
        ctx.fillRect(lastMove.to.x * 90, lastMove.to.y * 90, 90, 90);
        ctx.globalAlpha = 1;
    }

    // Draw pieces
    let fenBoard = fen.split(" ")[0];
    let x = boardFlipped ? 7 : 0, y = x;
    
    for (let character of fenBoard) {
        if (character == "/") {
            x = boardFlipped ? 7 : 0;
            y += boardFlipped ? -1 : 1;
        } else if (/\d/g.test(character)) {
            x += parseInt(character) * (boardFlipped ? -1 : 1);
        } else {
            ctx.drawImage(pieceImages[character], x * 90, y * 90, 90, 90);
            x += boardFlipped ? -1 : 1;
        }
    }

    // Draw last move classification
    if (currentMoveIndex > 0) {
        let classification = evaluatedPositions[currentMoveIndex].classification;
        ctx.drawImage(
            classificationIcons[classification], 
            lastMove.to.x * 90 + 68, 
            lastMove.to.y * 90 - 10, 
            32, 32
        );
    }
}

function updateBoardPlayers() {
    let whitePlayerProfile = boardFlipped ? blackPlayer : whitePlayer;
    let blackPlayerProfile = boardFlipped ? whitePlayer : blackPlayer;

    $("#black-player-profile").html(`${blackPlayerProfile.username} (${blackPlayerProfile.rating})`);
    $("#white-player-profile").html(`${whitePlayerProfile.username} (${whitePlayerProfile.rating})`);
}

function traverseMoves(moveCount) {
    if (ongoingEvaluation) return;

    let alreadyAtEndPosition = currentMoveIndex == evaluatedPositions.length - 1;

    currentMoveIndex = Math.max(
        Math.min(currentMoveIndex + moveCount, evaluatedPositions.length - 1),
        0,
    );

    drawBoard(evaluatedPositions[currentMoveIndex].fen);

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

    drawBoard(evaluatedPositions[currentMoveIndex].fen);
    updateBoardPlayers();
});