import { drawBoard } from "./board.js";
import { pieceLoaders } from "./sprites.js";
import { drawEvaluationBar } from "./evalbar.js";
import { startingPositionFen } from "./board.js";
import "./loadgame.js";
import "./analysis.js";

function init() {
    Promise.all(pieceLoaders).then(() => {
        drawBoard(startingPositionFen);
        drawEvaluationBar({ type: "cp", value: 0 });
    });
}

init();
