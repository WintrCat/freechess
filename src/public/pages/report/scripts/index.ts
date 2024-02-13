import { drawBoard } from "./board";
import { pieceLoaders } from "./sprites";
import { drawEvaluationBar } from "./evalbar";
import { startingPositionFen } from "./board";

function init() {
    console.log("aangeroepen");
    Promise.all(pieceLoaders).then(() => {
        drawBoard(startingPositionFen);
        drawEvaluationBar({ type: "cp", value: 0 });
    });
}

init();
