const ctx = ($("#board").get(0)! as HTMLCanvasElement).getContext("2d")!;

const startingPositionFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const classificationColours: {[key: string]: string} = {
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

let whitePlayer: Profile = {
    username: "White Player",
    rating: "?"
};
let blackPlayer: Profile = {
    username: "Black Player",
    rating: "?"
};

function getBoardCoordinates(square: string): Coordinate {
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

async function drawBoard(fen: string) {
    // Draw surface of board
    let colours = ["#f6dfc0", "#b88767"];

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            ctx.fillStyle = colours[(x + y) % 2];

            ctx.fillRect(x * 90, y * 90, 90, 90);
        }
    }

    // Draw last move highlight
    let lastMove: UCIMove = {
        from: { x: 0, y: 0 },
        to: { x: 0, y: 0 }
    };

    if (currentMoveIndex > 0) {
        let lastMoveUCI = reportResults[currentMoveIndex].move!.uci;

        lastMove.from = getBoardCoordinates(lastMoveUCI.slice(0, 2));
        lastMove.to = getBoardCoordinates(lastMoveUCI.slice(2));

        ctx.globalAlpha = 0.7;
        ctx.fillStyle = classificationColours[reportResults[currentMoveIndex]!.classification || "book"];
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
        let classification = reportResults[currentMoveIndex].classification;
        ctx.drawImage(
            classificationIcons[classification!]!, 
            lastMove.to.x * 90 + 68, 
            lastMove.to.y * 90 - 10, 
            32, 32
        );
    }
}

function updateBoardPlayers() {
    // Get profiles depending on board orientation
    let bottomPlayerProfile = boardFlipped ? blackPlayer : whitePlayer;
    let topPlayerProfile = boardFlipped ? whitePlayer : blackPlayer;

    // Remove <> characters to prevent XSS
    topPlayerProfile.username = topPlayerProfile.username.replace(/[<>]/g, "");
    topPlayerProfile.rating = topPlayerProfile.rating.replace(/[<>]/g, "");

    bottomPlayerProfile.username = bottomPlayerProfile.username.replace(/[<>]/g, "");
    bottomPlayerProfile.rating = bottomPlayerProfile.rating.replace(/[<>]/g, "");

    // Apply profiles to board
    $("#top-player-profile").html(`${topPlayerProfile.username} (${topPlayerProfile.rating})`);
    $("#bottom-player-profile").html(`${bottomPlayerProfile.username} (${bottomPlayerProfile.rating})`);
}

function traverseMoves(moveCount: number) {
    if (ongoingEvaluation) return;

    let alreadyAtEndPosition = currentMoveIndex == reportResults.length - 1;

    currentMoveIndex = Math.max(
        Math.min(currentMoveIndex + moveCount, reportResults.length - 1),
        0,
    );

    if (reportResults.length > 0) {
        drawBoard(reportResults[currentMoveIndex].fen);
        drawEvaluationBar(reportResults[currentMoveIndex].evaluation!);
    }

    // Do not play board audio if at start or end
    if (currentMoveIndex == 0 || (alreadyAtEndPosition && moveCount > 0)) return;

    // Stop all playing board audio
    for (let boardSoundElement of $(".sound-fx-board").get()) {
        let boardSound = boardSoundElement as HTMLAudioElement;

        boardSound.pause();
        boardSound.currentTime = 0;
    }

    // Play new audio based on move type
    let moveSAN = reportResults[currentMoveIndex + (moveCount == -1 ? 1 : 0)].move!.san;

    if (moveSAN.endsWith("#")) {
        let checkSound = $("#sound-fx-check").get(0)! as HTMLAudioElement;
        let gameEndSound = $("#sound-fx-game-end").get(0)! as HTMLAudioElement;
        checkSound.play();
        gameEndSound.play();
    } else if (moveSAN.endsWith("+")) {
        let checkSound = $("#sound-fx-check").get(0)! as HTMLAudioElement;
        checkSound.play();
    } else if (/=[QRBN]/g.test(moveSAN)) {
        let promoteSound = $("#sound-fx-promote").get(0)! as HTMLAudioElement;
        promoteSound.play();
    } else if (moveSAN.includes("O-O")) {
        let castleSound = $("#sound-fx-castle").get(0)! as HTMLAudioElement;
        castleSound.play();
    } else if (moveSAN.includes("x")) {
        let captureSound = $("#sound-fx-capture").get(0)! as HTMLAudioElement;
        captureSound.play();
    } else {
        let moveSound = $("#sound-fx-move").get(0)! as HTMLAudioElement;
        moveSound.play();
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

    drawBoard(reportResults[currentMoveIndex]?.fen || startingPositionFen);
    updateBoardPlayers();
});

Promise.all(pieceLoaders).then(() => {
    drawBoard(startingPositionFen);
    drawEvaluationBar({ type: "cp", value: 0 });
});