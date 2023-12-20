import { Router } from "express";
import fetch from "node-fetch";
import { Chess } from "chess.js";
import pgnParser from "pgn-parser";

import analyse from "./lib/analysis";
import Position from "./lib/types/Position";
import { ParseRequestBody, ReportRequestBody } from "./lib/types/RequestBody";

export const router = Router();

router.post("/parse", async (req, res) => {

    let { pgn }: ParseRequestBody = req.body;
    
    if (!pgn) {
        return res.json({ success: false });
    }

    // Parse PGN into object
    try {
        var [ parsedPGN ] = pgnParser.parse(pgn);

        if (!parsedPGN) {
            return res.json({ success: false, message: "Please provide a PGN." });
        }
    } catch (err) {
        return res.json({ success: false, message: "Failed to parse invalid PGN." });
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
            console.log(moveSAN + " is illegal move.");
            return res.json({ success: false, message: "PGN contains illegal moves." });
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

    res.json({
        success: true,
        positions: positions
    });

});

router.post("/report", async (req, res) => {

    let { positions, captchaToken }: ReportRequestBody = req.body;

    if (!positions || !captchaToken) {
        return res.json({ success: false });
    }

    console.log("RECEIVED REPORT REQUEST!");

    // Verify CAPTCHA response token
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
                return res.json({ success: false, message: "You must complete the CAPTCHA." });
            }
        } catch (err) {
            return res.json({ success: false, message: "Failed to verify CAPTCHA." });
        }
    }

    // Analyse positions to produce results
    try {
        var results = await analyse(positions);
    } catch (err) {
        return res.json({ success: false, message: "Failed to generate report." });
    }

    res.json({ success: true, results: results });

});

export default router;