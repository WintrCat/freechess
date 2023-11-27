const { Router } = require("express");
const pgnParser = require("pgn-parser");
const { Chess } = require("chess.js");

const analyse = require("./analysis");

/**
 * @type {Router}
 */
const router = new Router();

router.post("/parse", async (req, res) => {

    let { pgn = "" } = req.body;

    try {
        // parse PGN
        var [ game ] = pgnParser.parse(pgn);

        // If no PGN found to parse, status 400
        if (!game) return res.sendStatus(400);
    } catch (err) {
        // If invalid PGN throws error, status 400
        return res.sendStatus(400);
    }

    // Create a virtual board
    let board = new Chess();
    let positions = [
        {
            fen: board.fen()
        }
    ];

    // Add each move to the board; log FEN and SAN
    for (let move of game.moves) {
        board.move(move.move);

        positions.push({
            fen: board.fen(),
            move: move.move
        });
    }

    // Respond with positions object
    res.json(positions);

});

router.post("/report", async (req, res) => {

    let { positions = null, captchaToken = "" } = req.body;

    if (positions == null) {
        return res.sendStatus(400);
    }

    analyse(positions);

    res.json({});

});

module.exports = router;