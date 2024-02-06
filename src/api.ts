import { Router } from "express";
import fetch from "node-fetch";
import { Chess } from "chess.js";
import pgnParser from "pgn-parser";

import analyse from "./lib/analysis";
import { Position } from "./lib/types/Position";
import { ParseRequestBody, ReportRequestBody } from "./lib/types/RequestBody";

const router = Router();

router.post("/parse", async (req, res) => {

    let { pgn }: ParseRequestBody = req.body;
    
    if (!pgn) {
        return res.status(400).json({ message: "Enter a PGN to analyse." });
    }

    // Parse PGN into object
    try {
        var [ parsedPGN ] = pgnParser.parse(pgn);

        if (!parsedPGN) {
            return res.status(400).json({ message: "Enter a PGN to analyse." });
        }
    } catch (err) {
        return res.status(500).json({ message: "Failed to parse invalid PGN." });
    }

    // Create a virtual board
    let board = new Chess();
    let positions: Position[] = [];

    positions.push({ fen: board.fen() });

    // Add each move to the board; log FEN and SAN
    for (let pgnMove of parsedPGN.moves) {
        let moveSAN = pgnMove.move;

        let virtualBoardMove;
        try {
            virtualBoardMove = board.move(moveSAN);
        } catch (err) {
            return res.status(400).json({ message: "PGN contains illegal moves." });
        }

        let moveUCI = virtualBoardMove.from + virtualBoardMove.to;

        positions.push({
            fen: board.fen(),
            move: {
                san: moveSAN,
                uci: moveUCI
            }
        });
    }

    res.json({ positions });

});

router.post("/report", async (req, res) => {
    let { positions, captchaToken }: ReportRequestBody = req.body;

    if (!positions || !captchaToken) {
        return res.status(400).json({ message: "Missing parameters." });
    }

    if (process.env.USE_RECAPTCHA != null || process.env.USE_RECAPTCHA == true){

        // Verify CAPTCHA response token
        if (!process.env.DEV) {
            try {
                let captchaResponse = await fetch("https://www.google.com/recaptcha/api/siteverify", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: `secret=${process.env.RECAPTCHA_SECRET}&response=${captchaToken}`
                });
        
                let captchaResult = await captchaResponse.json();
                if (!captchaResult.success) {
                    return res.status(400).json({ message: "You must complete the CAPTCHA or you haven't used DEV=true / set a site key in .env." });
                }
            } catch (err) {
                return res.status(500).json({ message: "Failed to verify CAPTCHA." });
            }
        }
    } else {
        console.log(".env USE_RECAPTCHA doesn't exist or is set to false!");
    }

    // Generate report
    try {
        var results = await analyse(positions);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Failed to generate report." });
    }

    res.json({ results });

});

export default router;