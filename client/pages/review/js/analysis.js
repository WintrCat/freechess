const wasmSupported = typeof WebAssembly == "object";

let positionBatchDepths = new Map();

async function post(url, body) {
    let response = await fetch(url, {
        "method": "POST",
        "headers": {
            "Content-Type": "application/json"
        },
        "body": JSON.stringify(body)
    });

    return await response.json();
}

async function evaluatePosition(position) {
    return new Promise((res, rej) => {
        let stockfish = new Worker("/static/scripts/stockfish" + (wasmSupported ? ".wasm.js" : ".js"));

        stockfish.postMessage("uci");
        stockfish.postMessage("position fen " + position.fen);
        stockfish.postMessage("go depth 18");

        stockfish.addEventListener("message", event => {

            let message = event.data;

            if (message.startsWith("info depth")) {
                let depth = parseInt(message.match(/(?<=info depth )\d+/)[0]);
                positionBatchDepths.set(stockfish, depth);
            }

            if (/^info depth (18|0)/.test(message)) {
                position.evaluation = {
                    type: message.match(/ cp /g) ? "cp" : "mate",
                    value: message.match(/(?<=[cp|mate] )[\d-]+/g)[0]
                };
                stockfish.terminate();
                res(true);
            }

        });
    });
}

function logAnalysisInfo(message) {
    $("#error-message").css("color", "white");
    $("#error-message").html(message);
}

function logAnalysisError(message) {
    $("#performance-message").css("display", "none");
    $("#error-message").css("color", "rgb(255, 53, 53)");
    $("#error-message").html(message);
}

async function analyse() {

    let pgn = $("#pgn").val();

    // validate PGN input
    if (pgn.length == 0) {
        return logAnalysisError("Enter a PGN to analyse.");
    }

    // post PGN contents to fetch fens of position after each move
    logAnalysisInfo("Parsing PGN...");

    try {
        var fens = await post("/api/fens", { pgn });
    } catch (err) {
        return logAnalysisError("Failed to parse PGN file.");
    }

    // update player profile cards and performance message
    $("#white-player-profile").html(pgn.match(/(?<=\[White ").+(?="\])/)[0]);
    $("#black-player-profile").html(pgn.match(/(?<=\[Black ").+(?="\])/)[0]);
    $("#performance-message").css("display", "inline");

    // evaluate all fens in batches of 16
    let positions = fens.map(fen => {
        return {
            fen: fen,
            evaluation: null
        };
    });

    let progressMonitor;

    for (var i = 0; i < positions.length; i += 8) {
        positionBatchDepths.clear();
        if (!progressMonitor) {
            progressMonitor = setInterval(() => {
                let batchProgress = 0;
                for (let batchDepth of positionBatchDepths.values()) {
                    batchProgress += batchDepth;
                }

                let progress = ((i / positions.length) + (batchProgress / (18 * 8)) * (8 / positions.length)) * 100;

                logAnalysisInfo(`Evaluating moves... (${progress.toFixed(1)}%)`);
            }, 10);
        }

        let workers = [];
        for (let position of positions.slice(i, i + 8)) {
            workers.push(evaluatePosition(position));
        }

        await Promise.all(workers);
    }

    clearInterval(progressMonitor);

    // post evaluations and get report results
    logAnalysisInfo("Classifying moves...");

    try {
        await post("/api/report", {
            positions: positions,
            captchaToken: ""
        });
    } catch (err) {
        return logAnalysisError("Failed to evaluate positions.");
    }

}

$("#review-button").click(analyse);