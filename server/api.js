const { Router } = require("express");
const pgnParser = require("pgn-parser");

/**
 * @type {Router}
 */
const router = new Router();

router.post("/fens", async (req, res) => {

    let { pgn = "" } = req.body;

    try {
        var [ game ] = pgnParser.parse(pgn);
    } catch (err) {
        return res.sendStatus(400);
    }

});

module.exports = router;