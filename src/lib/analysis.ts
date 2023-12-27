import { Chess } from "chess.js";

import { 
    Classification, 
    centipawnClassifications, 
    getEvaluationLossThreshold 
} from "./classification";
import { EvaluatedPosition } from "./types/Position";

async function analyse(positions: EvaluatedPosition[]) {
    
    let positionIndex = 0;
    for (let position of positions.slice(1)) {

        positionIndex++;

        let lastPosition = positions[positionIndex - 1];
        
        let topMove = lastPosition.topLines.find(line => line.id == 1);
        let secondTopMove = lastPosition.topLines.find(line => line.id == 2);
        if (!topMove) continue;

        let previousEvaluation = topMove?.evaluation;
        let evaluation = position.topLines.find(line => line.id == 1)?.evaluation;
        if (!previousEvaluation) continue;

        // If there are no legal moves in this position, game is in terminal state
        if (!evaluation) {
            let board = new Chess(position.fen);
            evaluation = { type: board.isCheckmate() ? "mate" : "cp", value: 0 };
            position.topLines.push({
                id: 1,
                depth: topMove.depth,
                evaluation: evaluation,
                moveUCI: ""
            });
        }
        
        // Calculate evaluation loss as a result of this move
        let evalLoss = 0;
        if (lastPosition.fen.includes(" b ")) {
            evalLoss = evaluation.value - previousEvaluation.value
        } else {
            evalLoss = previousEvaluation.value - evaluation.value
        }

        // If this move was the only legal one, apply forced
        if (!secondTopMove) {
            position.classification = Classification.FORCED;
            continue;
        }

        let noMate = previousEvaluation.type == "cp" && evaluation.type == "cp";

        // If it is the top line, disregard other detections and give best
        let topMovePlayed = topMove.moveUCI == position.move.uci;
        if (topMovePlayed) {
            if (noMate && Math.abs(topMove.evaluation.value - secondTopMove.evaluation.value) >= 150) {
                position.classification = Classification.GREAT;
            } else {
                position.classification = Classification.BEST;
            }
            continue;
        }

        // If no mate on the board last move and still no mate
        if (noMate) {

            if (topMovePlayed && Math.abs(topMove.evaluation.value - secondTopMove.evaluation.value) >= 1.5) {
                position.classification = Classification.GREAT;
                continue;
            }

            for (let classif of centipawnClassifications) {
                if (evalLoss <= getEvaluationLossThreshold(classif, previousEvaluation.value)) {
                    position.classification = classif;
                    break;
                }
            }

        }

        position.classification ??= Classification.BOOK;

    }

    const positiveClassifs = centipawnClassifications.slice(0, 3);
    for (let position of positions.slice(1)) {
        if (position.worker == "cloud" && positiveClassifs.includes(position.classification!)) {
            position.classification = Classification.BOOK;
        } else {
            break;
        }
    }

    return positions;

}

export default analyse;