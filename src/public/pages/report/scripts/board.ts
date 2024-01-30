const ctx = $<HTMLCanvasElement>("#board").get(0)!.getContext("2d")!;

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

function drawArrow(fromX: number, fromY: number, toX: number, toY: number, width: number) {
    let arrowCtx = $<HTMLCanvasElement>("<canvas>").get(0)?.getContext("2d");
    if (!arrowCtx) return;

    arrowCtx.canvas.width = 720;
    arrowCtx.canvas.height = 720;

    let headlen = 15;
    let angle = Math.atan2(toY - fromY, toX - fromX);
    toX -= Math.cos(angle) * ((width * 1.15));
    toY -= Math.sin(angle) * ((width * 1.15));
    
    arrowCtx.beginPath();
    arrowCtx.moveTo(fromX, fromY);
    arrowCtx.lineTo(toX, toY);
    arrowCtx.strokeStyle = classificationColours.best;
    arrowCtx.lineWidth = width;
    arrowCtx.stroke();
    
    arrowCtx.beginPath();
    arrowCtx.moveTo(toX, toY);
    arrowCtx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 7), toY - headlen * Math.sin(angle - Math.PI / 7));
    
    arrowCtx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 7), toY - headlen * Math.sin(angle + Math.PI / 7));
    
    arrowCtx.lineTo(toX, toY);
    arrowCtx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 7),toY - headlen * Math.sin(angle - Math.PI / 7));

    arrowCtx.strokeStyle = classificationColours.best;
    arrowCtx.lineWidth = width;
    arrowCtx.stroke();
    arrowCtx.fillStyle = classificationColours.best;
    arrowCtx.fill();

    return arrowCtx.canvas;
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

    // Draw coordinates
    ctx.font = "20px Arial";
    
    let files = "abcdefgh".split("");
    for (let x = 0; x < 8; x++) {
        ctx.fillStyle = colours[x % 2];
        ctx.fillText(boardFlipped ? files[7 - x] : files[x], x * 90 + 5, 715);
    }
    for (let y = 0; y < 8; y++) {
        ctx.fillStyle = colours[(y + 1) % 2];
        ctx.fillText(boardFlipped ? (y + 1).toString() : (8 - y).toString(), 5, y * 90 + 22);
    }

    // Draw last move highlight and top move arrows
    let lastMove = reportResults?.positions[currentMoveIndex];
    
    let lastMoveCoordinates = {
        from: { x: 0, y: 0 },
        to: { x: 0, y: 0 }
    };

    if (currentMoveIndex > 0 && lastMove) {
        let lastMoveUCI = lastMove.move?.uci;
        if (!lastMoveUCI) return;

        lastMoveCoordinates.from = getBoardCoordinates(lastMoveUCI.slice(0, 2));
        lastMoveCoordinates.to = getBoardCoordinates(lastMoveUCI.slice(2, 4));

        ctx.globalAlpha = 0.7;
        ctx.fillStyle = classificationColours[reportResults?.positions[currentMoveIndex].classification ?? "book"];
        ctx.fillRect(lastMoveCoordinates.from.x * 90, lastMoveCoordinates.from.y * 90, 90, 90);
        ctx.fillRect(lastMoveCoordinates.to.x * 90, lastMoveCoordinates.to.y * 90, 90, 90);
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
    if (currentMoveIndex > 0 && reportResults) {
        let classification = reportResults?.positions[currentMoveIndex]?.classification;

        if (!classification) return;
        ctx.drawImage(
            classificationIcons[classification]!,
            lastMoveCoordinates.to.x * 90 + 68, 
            lastMoveCoordinates.to.y * 90 - 10, 
            32, 32
        );
    }

    // Draw engine suggestion arrows
    if ($<HTMLInputElement>("#suggestion-arrows-setting").get(0)?.checked) {
        let arrowAttributes = [
            {
                width: 20,
                opacity: 0.8
            },
            {
                width: 12,
                opacity: 0.55
            }
        ];
        
        let topLineIndex = -1;
        for (let topLine of lastMove?.topLines ?? []) {
            topLineIndex++;
    
            let from = getBoardCoordinates(topLine.moveUCI.slice(0, 2));
            let to = getBoardCoordinates(topLine.moveUCI.slice(2, 4));
    
            let arrow = drawArrow(from.x * 90 + 45, from.y * 90 + 45, to.x * 90 + 45, to.y * 90 + 45, arrowAttributes[topLineIndex].width);
            if (!arrow) continue;
    
            ctx.globalAlpha = arrowAttributes[topLineIndex].opacity;
            ctx.drawImage(arrow, 0, 0);
            ctx.globalAlpha = 1;
        }
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
    if (ongoingEvaluation || !reportResults) return;

    let positions = reportResults.positions;

    // Clamp move index to number of moves in game
    let previousMoveIndex = currentMoveIndex;
    currentMoveIndex = Math.max(
        Math.min(currentMoveIndex + moveCount, reportResults.positions.length - 1),
        0,
    );

    let currentPosition = positions[currentMoveIndex];

    // Draw board, evaluation bar, update report card
    drawBoard(currentPosition?.fen ?? startingPositionFen);

    let topLine = currentPosition?.topLines?.find(line => line.id == 1);
    drawEvaluationBar(topLine?.evaluation ?? { type: "cp", value: 0 });

    updateClassificationMessage(positions[currentMoveIndex - 1], currentPosition);
    updateEngineSuggestions(currentPosition.topLines ?? []);
    if (currentPosition.opening) {
        $("#opening-name").html(currentPosition.opening);
    }

    // Do not play board audio if trying to traverse outside of game
    if (
        (previousMoveIndex == 0 && moveCount < 0) 
        || (previousMoveIndex == positions.length - 1 && moveCount > 0)
    ) return;

    // Stop all playing board audio
    for (let boardSound of $<HTMLAudioElement>(".sound-fx-board").get()) {
        boardSound.pause();
        boardSound.currentTime = 0;
    }

    // Play new audio based on move type
    let moveSAN = positions[currentMoveIndex + (moveCount == -1 ? 1 : 0)].move?.san ?? "";

    if (moveSAN.endsWith("#")) {
        let checkSound = $<HTMLAudioElement>("#sound-fx-check").get(0);
        let gameEndSound = $<HTMLAudioElement>("#sound-fx-game-end").get(0);
        if (checkSound && gameEndSound) {
            checkSound.play();
            gameEndSound.play();
        }
    } else if (moveSAN.endsWith("+")) {
        let checkSound = $<HTMLAudioElement>("#sound-fx-check").get(0);
        if (checkSound) checkSound.play();
    } else if (/=[QRBN]/g.test(moveSAN)) {
        let promoteSound = $<HTMLAudioElement>("#sound-fx-promote").get(0);
        if (promoteSound) promoteSound.play();
    } else if (moveSAN.includes("O-O")) {
        let castleSound = $<HTMLAudioElement>("#sound-fx-castle").get(0);
        if (castleSound) castleSound.play();
    } else if (moveSAN.includes("x")) {
        let captureSound = $<HTMLAudioElement>("#sound-fx-capture").get(0);
        if (captureSound) captureSound.play();
    } else {
        let moveSound = $<HTMLAudioElement>("#sound-fx-move").get(0);
        if (moveSound) moveSound.play();
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

$("#board").on("click", event => {
    let boardBoundingBox = $<HTMLCanvasElement>("#board").get(0)?.getBoundingClientRect();
    if (!boardBoundingBox) return;

    traverseMoves(event.clientX > boardBoundingBox.left + boardBoundingBox.width / 2 ? 1 : -1);
});

$("#flip-board-button").on("click", () => {
    boardFlipped = !boardFlipped;

    drawBoard(reportResults?.positions[currentMoveIndex]?.fen ?? startingPositionFen); 
    updateBoardPlayers();
});

$("#suggestion-arrows-setting").on("input", () => {
    drawBoard(reportResults?.positions[currentMoveIndex]?.fen ?? startingPositionFen); 
});

Promise.all(pieceLoaders).then(() => {
    drawBoard(startingPositionFen);
    drawEvaluationBar({ type: "cp", value: 0 });
});