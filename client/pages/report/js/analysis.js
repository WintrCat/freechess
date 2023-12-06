let ongoingEvaluation = false;

/**
 * @type {{
 *  fen: string,
 *  move: {
 *      san: string,
 *      uci: string
 *  },
 *  evaluation: {
 *      type: string,
 *      value: number,
 *      top: string
 *  },
 *  classification: string | undefined
 * }[]}
 */
let evaluatedPositions = [
    {
        fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    }
];

function logAnalysisInfo(message) {
    $("#status-message").css("color", "white");
    $("#status-message").html(message);
}

function logAnalysisError(message) {
    $("#secondary-message").html("");
    $("#status-message").css("color", "rgb(255, 53, 53)");
    $("#status-message").html(message);

    ongoingEvaluation = false;
}

async function evaluate() {

    // Remove and reset CAPTCHA in case it is verified from last evaluation
    $(".g-recaptcha").css("display", "none");
    grecaptcha.reset();

    // Disallow evaluation if another evaluation is ongoing
    if (ongoingEvaluation) return;
    ongoingEvaluation = true;

    // Extract input PGN and target depth
    let pgn = $("#pgn").val();
    let depth = parseInt($("#depth-slider").val());

    // Content validate PGN input
    if (pgn.length == 0) {
        return logAnalysisError("Enter a PGN to analyse.");
    }

    // Post PGN to server to have it parsed
    logAnalysisInfo("Parsing PGN...");

    try {
        // JSON list, keys fen, move: { san, uci }
        var positions = await REST.post("/api/parse", { pgn });

        if (typeof positions == "string") {
            throw new Error();
        }
    } catch (err) {
        return logAnalysisError("Failed to parse PGN file.");
    }

    // Update board player usernames
    let whitePlayerUsername = pgn.match(/(?<=\[White ").+(?="\])/);
    whitePlayer.username = whitePlayerUsername ? whitePlayerUsername[0] : "White Player";

    let whitePlayerRating = pgn.match(/(?<=\[WhiteElo ").+(?="\])/);
    whitePlayer.rating = whitePlayerRating ? whitePlayerRating[0] : "?";

    let blackPlayerUsername = pgn.match(/(?<=\[Black ").+(?="\])/);
    blackPlayer.username = blackPlayerUsername ? blackPlayerUsername[0] : "Black Player";

    let blackPlayerRating = pgn.match(/(?<=\[BlackElo ").+(?="\])/);
    blackPlayer.rating = blackPlayerRating ? blackPlayerRating[0] : "?";

    updateBoardPlayers();

    // Display progress bar and secondary message
    $("#evaluation-progress-bar").css("display", "inline");
    
    $("#secondary-message").html("It can take around a minute to process a full game.")

    let workerCount = 0;

    // Fetch cloud evaluations where possible
    for (let position of positions) {
        let queryFen = position.fen.replace(/\s/g, "%20");
        
        let cloudEvaluation = await REST.get("https://lichess.org/api/cloud-eval?fen=" + queryFen);
        if (typeof cloudEvaluation == "object") {
            position.evaluation = {
                type: cloudEvaluation.pvs[0].cp ? "cp" : "mate",
                value: cloudEvaluation.pvs[0].cp ?? cloudEvaluation.pvs[0].mate
            };

            position.worker = { depth };
        } else {
            break;
        }

        let progress = (positions.indexOf(position) + 1) / positions.length * 100;
        $("#evaluation-progress-bar").attr("value", progress);
        logAnalysisInfo(`Evaluating positions... (${progress.toFixed(1)}%)`);
    }

    // Evaluate remaining positions
    let stockfishManager = setInterval(() => {
        // If all evaluations have been generated, move on
        if (!positions.some(pos => !pos.evaluation)) {
            clearInterval(stockfishManager);

            logAnalysisInfo("Evaluation complete.");
            $(".g-recaptcha").css("display", "inline");
            $("#secondary-message").html("Please complete the CAPTCHA to continue.");

            evaluatedPositions = positions;
            ongoingEvaluation = false;
            return;
        }

        // Find next position with no worker and add new one
        for (let position of positions) {
            if (position.worker || workerCount >= 8) continue;

            position.worker = new Stockfish();
            position.worker.evaluate(position.fen, depth).then(evaluation => {
                position.evaluation = evaluation;
                workerCount--;
            });

            workerCount++;
        }

        // Update progress monitor
        let workerDepths = 0;
        for (let position of positions) {
            if (!position.evaluation) {
                workerDepths += position.worker ? position.worker.depth : 0;
            } else {
                workerDepths += depth;
            }
        }

        let progress = workerDepths / (positions.length * depth) * 100;

        $("#evaluation-progress-bar").attr("value", progress);
        logAnalysisInfo(`Evaluating positions... (${progress.toFixed(1)}%)`);
    }, 10);

}

async function report() {

    // Remove CAPTCHA and update progress bar
    $(".g-recaptcha").css("display", "none");
    $("#evaluation-progress-bar").attr("value", null);
    $("#secondary-message").html("");
    logAnalysisInfo("Generating report...");

    // Post evaluations and get report results
    try {
        let results = await REST.post("/api/report", {
            positions: evaluatedPositions.map(pos => {
                pos.worker = undefined;
                return pos;
            }),
            captchaToken: grecaptcha.getResponse()
        });

        if (typeof results == "string") {
            return logAnalysisError(results);
        }

        evaluatedPositions = results;
    } catch (err) {
        console.log(err);
        return logAnalysisError("Failed to generate report.");
    }

}

$("#review-button").on("click", evaluate);

$("#depth-slider").on("input", () => {
    let depth = parseInt($("#depth-slider").val());

    if (depth <= 15) {
        $("#depth-counter").html(depth + " ⚡");
    } else if (depth <= 18) {
        $("#depth-counter").html(depth + " 🐇");
    } else {
        $("#depth-counter").html(depth + " 🐢");
    }
});