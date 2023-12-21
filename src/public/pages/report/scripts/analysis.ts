let ongoingEvaluation = false;

let evaluatedPositions: Position[] = [];
let reportResults: Position[] = [];

function logAnalysisInfo(message: string) {
    $("#status-message").css("color", "white");
    $("#status-message").html(message);
}

function logAnalysisError(message: string) {
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
    let pgn = $("#pgn").val()!.toString();
    let depth = parseInt($("#depth-slider").val()!.toString());

    // Content validate PGN input
    if (pgn.length == 0) {
        return logAnalysisError("Provide a game to analyse.");
    }

    // Post PGN to server to have it parsed
    logAnalysisInfo("Parsing PGN...");

    try {
        let parseResponse = await fetch("/api/parse", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ pgn })
        });

        let parsedPGN: ParseResponse = await parseResponse.json();

        if (!parseResponse.ok) {
            return logAnalysisError(parsedPGN.message || "Failed to parse PGN.");
        }

        var positions = parsedPGN.positions!;
    } catch (err) {
        return logAnalysisError("Failed to parse PGN.");
    }

    // Update board player usernames
    whitePlayer.username = pgn.match(/(?<=\[White ").+(?="\])/)?.[0] || "White Player";
    whitePlayer.rating = pgn.match(/(?<=\[WhiteElo ").+(?="\])/)?.[0] || "?";

    blackPlayer.username = pgn.match(/(?<=\[Black ").+(?="\])/)?.[0] || "Black Player";
    blackPlayer.rating = pgn.match(/(?<=\[BlackElo ").+(?="\])/)?.[0] || "?";

    updateBoardPlayers();

    // Display progress bar and secondary message
    $("#evaluation-progress-bar").css("display", "inline");
    
    $("#secondary-message").html("It can take around a minute to process a full game.")

    // Fetch cloud evaluations where possible
    for (let position of positions) {
        let queryFen = position.fen.replace(/\s/g, "%20");
        let cloudEvaluationResponse = await fetch("https://lichess.org/api/cloud-eval?fen=" + queryFen, {
            method: "GET"
        });

        if (!cloudEvaluationResponse.ok) break;

        let cloudEvaluation = await cloudEvaluationResponse.json();

        position.evaluation = {
            type: cloudEvaluation.pvs[0].cp ? "cp" : "mate",
            value: cloudEvaluation.pvs[0].cp || cloudEvaluation.pvs[0].mate
        };
        position.worker = "cloud";

        let progress = (positions.indexOf(position) + 1) / positions.length * 100;
        $("#evaluation-progress-bar").attr("value", progress);
        logAnalysisInfo(`Evaluating positions... (${progress.toFixed(1)}%)`);
    }

    // Evaluate remaining positions
    let workerCount = 0;

    const stockfishManager = setInterval(() => {
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

            let worker = new Stockfish();
            worker.evaluate(position.fen, depth).then(engineLines => {
                let topLine = engineLines.find(line => line.lineID == 1);

                position.evaluation = topLine?.evaluation || { type: "mate", value: 0 };
                workerCount--;
            });

            position.worker = worker;
            workerCount++;
        }

        // Update progress monitor
        let workerDepths = 0;
        for (let position of positions) {
            if (typeof position.worker == "object") {
                workerDepths += position.worker.depth;
            } else if (typeof position.worker == "string") {
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
        let reportResponse = await fetch("/api/report", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                positions: evaluatedPositions.map(pos => {
                    pos.worker = undefined;
                    return pos;
                }),
                captchaToken: grecaptcha.getResponse()
            })
        });

        let report: ReportResponse = await reportResponse.json();

        if (!reportResponse.ok) {
            return logAnalysisError(report.message || "Failed to generate report.");
        }

        reportResults = report.results || [];

        drawEvaluationBar(reportResults[0].evaluation!);
        logAnalysisInfo("");
        $("#evaluation-progress-bar").css("display", "none");
    } catch (err) {
        return logAnalysisError("Failed to generate report.");
    }

}

$("#review-button").on("click", evaluate);

$("#depth-slider").on("input", () => {
    let depth = parseInt($("#depth-slider").val()?.toString()!);

    if (depth <= 15) {
        $("#depth-counter").html(depth + " ⚡");
    } else if (depth <= 18) {
        $("#depth-counter").html(depth + " 🐇");
    } else {
        $("#depth-counter").html(depth + " 🐢");
    }
});