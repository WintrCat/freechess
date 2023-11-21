const { Router } = require("express");
const pgnParser = require("pgn-parser");
const { Chess } = require("chess.js");

/**
 * @type {Router}
 */
const router = new Router();

router.post("/fens", async (req, res) => {

    let { pgn = "" } = req.body;

    try {
        var [ game ] = pgnParser.parse(pgn);

        if (!game) return res.sendStatus(400);
    } catch (err) {
        return res.sendStatus(400);
    }

    let board = new Chess();
    let fens = [board.fen()];

    for (let pgnMove of game.moves) {
        board.move(pgnMove.move);
        fens.push(board.fen());
    }

    res.json(fens);

});

router.post("/report", async (req, res) => {

    let { positions = null, captchaToken = "" } = req.body;

    if (positions == null) {
        return res.sendStatus(400);
    }

});

module.exports = router;