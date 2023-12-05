const { Router } = require("express");
const fetch = require("node-fetch");
const { Chess } = require("chess.js");
const pgnParser = require("pgn-parser");

const analyse = require("./lib/analysis");

/**
 * @type {Router}
 */
const router = new Router();

router.post("/parse", async (req, res) => {

    let { pgn = "" } = req.body;

    try {
        var [ parsedPGN ] = pgnParser.parse(pgn);

        if (!parsedPGN) {
            return res.sendStatus(400);
        }
    } catch (err) {
        return res.sendStatus(400);
    }

    // Create a virtual board
    let board = new Chess();
    let positions = [
        {
            fen: board.fen(),
            move: {
                san: null,
                uci: null
            }
        }
    ];

    // Add each move to the board; log FEN and SAN
    for (let pgnMove of parsedPGN.moves) {
        let moveSAN = pgnMove.move;

        let virtualBoardMove = board.move(moveSAN);
        let moveUCI = virtualBoardMove.from + virtualBoardMove.to;

        positions.push({
            fen: board.fen(),
            move: {
                san: moveSAN,
                uci: moveUCI
            }
        });
    }

    // Respond with positions object
    res.json(positions);

});

router.post("/report", async (req, res) => {

    let { positions = null, captchaToken = "" } = req.body;

    console.log("RECEIVED REPORT REQUEST!");

    if (!process.env.DEV) {
        try {
            let captchaResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
                "method": "POST",
                "headers": {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                "body": `secret=${process.env.RECAPTCHA_SECRET}&response=${captchaToken}`
            });
    
            let captchaResult = await captchaResponse.json();
            if (!captchaResult.success) {
                return res.status(400).send("You must complete the CAPTCHA.");
            }
        } catch (err) {
            return res.status(400).send("Failed to verify CAPTCHA.");
        }
    }

    try {
        var results = await analyse(positions);
    } catch (err) {
        res.status(400).send("Failed to generate report.");
    }

    res.json(results);

});

module.exports = router;