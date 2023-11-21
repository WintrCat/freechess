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

async function analyse() {

    let pgn = $("#pgn").val();

    // send PGN contents to the webserver and store response (list of fens)
    try {
        var fens = await post("/api/fens", { pgn });
    } catch (err) {
        $("#error-message").html("Failed to parse PGN file.");
    }

    // until all fens have been evaluated, put a different fen on to each Stockfish worker available until none are.
    // in the event that a worker has finished, put it on a new fen and remove that fen from the list so other workers don't take it

    // now that all fens are evaluated (and stored in list or object or something)
    // post the PGN contents AND the fen evaluations to the server for classification
    // receive the results as object and return it

}

$("#review-button").click(analyse);