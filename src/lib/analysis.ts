import { Chess } from "chess.js";

import {
    Classification, 
    centipawnClassifications, 
    classificationValues, 
    getEvaluationLossThreshold 
} from "./classification";
import { EvaluatedPosition } from "./types/Position";
import Report from "./types/Report";

import openings from "../resources/openings.json";

async function analyse(positions: EvaluatedPosition[]): Promise<Report> {
    
    // Generate classifications for each position
    let positionIndex = 0;
    for (let position of positions.slice(1)) {

        positionIndex++;

        let board = new Chess(position.fen);

        let lastPosition = positions[positionIndex - 1];

        let topMove = lastPosition.topLines.find(line => line.id == 1);
        let secondTopMove = lastPosition.topLines.find(line => line.id == 2);
        if (!topMove) continue;

        let previousEvaluation = topMove?.evaluation;
        let evaluation = position.topLines.find(line => line.id == 1)?.evaluation;
        if (!previousEvaluation) continue;

        let moveColour = position.fen.includes(" b ") ? "white" : "black";

        // If there are no legal moves in this position, game is in terminal state
        if (!evaluation) {
            evaluation = { type: board.isCheckmate() ? "mate" : "cp", value: 0 };
            position.topLines.push({
                id: 1,
                depth: 0,
                evaluation: evaluation,
                moveUCI: ""
            });
        }
        
        // Calculate evaluation loss as a result of this move
        let evalLoss = Infinity;
        let cutoffEvalLoss = Infinity;

        if (lastPosition.cutoffEvaluation) {
            if (moveColour == "white") {
                cutoffEvalLoss = lastPosition.cutoffEvaluation.value - evaluation.value;
            } else {
                cutoffEvalLoss = evaluation.value - lastPosition.cutoffEvaluation.value;
            }   
        }

        if (moveColour == "white") {
            evalLoss = previousEvaluation.value - evaluation.value;
        } else {
            evalLoss = evaluation.value - previousEvaluation.value;
        }

        evalLoss = Math.min(evalLoss, cutoffEvalLoss);

        // If this move was the only legal one, apply forced
        if (!secondTopMove) {
            position.classification = Classification.FORCED;
            continue;
        }

        let noMate = previousEvaluation.type == "cp" && evaluation.type == "cp";

        // If it is the top line, disregard other detections and give best
        if (topMove.moveUCI == position.move.uci) {
            // Test for great move classification
            if (noMate && Math.abs(topMove.evaluation.value - secondTopMove.evaluation.value) >= 150) {
                if (moveColour == "white") {
                    if (
                        (previousEvaluation.value <= -150 && Math.abs(evaluation.value) <= 30)
                        || (Math.abs(previousEvaluation.value) <= 30 && evaluation.value >= 150)
                        || lastPosition.classification == Classification.BLUNDER
                    ) {
                        position.classification = Classification.GREAT;
                        continue;
                    }
                } else {
                    if (
                        (previousEvaluation.value >= 150 && Math.abs(evaluation.value) <= 30)
                        || (Math.abs(previousEvaluation.value) <= 30 && evaluation.value <= -150)
                        || lastPosition.classification == Classification.BLUNDER
                    ) {
                        position.classification = Classification.GREAT;
                        continue;
                    }
                }
            }

            position.classification = Classification.BEST;
            continue;
        }

        // If no mate on the board last move and still no mate
        if (noMate) {
            for (let classif of centipawnClassifications) {
                if (evalLoss <= getEvaluationLossThreshold(classif, previousEvaluation.value)) {
                    position.classification = classif;

                    let absoluteValue = evaluation.value * (moveColour == "white" ? 1 : -1);
                    if (position.classification == Classification.BLUNDER && absoluteValue >= 600) {
                        position.classification = Classification.GOOD;
                    }

                    break;
                }
            }
        }

        // If no mate last move but you blundered a mate
        if (previousEvaluation.type == "cp" && evaluation.type == "mate") {
            let absoluteMate = Math.abs(evaluation.value);

            if (absoluteMate <= 2) {
                position.classification = Classification.BLUNDER;
            } else if (absoluteMate <= 5) {
                position.classification = Classification.MISTAKE;
            } else {
                position.classification = Classification.INACCURACY;
            }
            continue;
        }

        // If mate last move and there is no longer a mate
        if (previousEvaluation.type == "mate" && evaluation.type == "cp") {
            let absoluteValue = evaluation.value * (moveColour == "white" ? 1 : -1);

            if (absoluteValue >= 400) {
                position.classification = Classification.GOOD;
            } else if (absoluteValue >= 150) {
                position.classification = Classification.INACCURACY;
            } else if (absoluteValue >= -100) {
                position.classification = Classification.MISTAKE;
            } else {
                position.classification = Classification.BLUNDER;
            }
            continue;
        }

        // If mate last move and forced mate still exists
        if (previousEvaluation.type == "mate" && evaluation.type == "mate") {
            let prevAbsoluteMate = previousEvaluation.value * (moveColour == "white" ? 1 : -1);
            let newAbsoluteMate = evaluation.value * (moveColour == "white" ? 1 : -1);

            if (prevAbsoluteMate > 0) {
                if (newAbsoluteMate <= -4) {
                    position.classification = Classification.MISTAKE;
                } else if (newAbsoluteMate < 0) {
                    position.classification = Classification.BLUNDER
                } else if (newAbsoluteMate < prevAbsoluteMate) {
                    position.classification = Classification.BEST;
                } else if (newAbsoluteMate <= prevAbsoluteMate + 2) {
                    position.classification = Classification.EXCELLENT;
                } else {
                    position.classification = Classification.GOOD;
                }
            } else {
                if (newAbsoluteMate == prevAbsoluteMate) {
                    position.classification = Classification.BEST;
                } else {
                    position.classification = Classification.GOOD;
                }
            }

            continue;
        }

        position.classification ??= Classification.BOOK;

    }

    // Generate opening names for named positions
    for (let position of positions) {
        let opening = openings.find(opening => position.fen.includes(opening.fen));
        position.opening = opening?.name;
    }

    // Apply book moves for cloud evaluations and named positions
    const positiveClassifs = centipawnClassifications.slice(0, 2);
    for (let position of positions.slice(1)) {
        if (
            (position.worker == "cloud" && positiveClassifs.includes(position.classification!))
            || position.opening
        ) {
            position.classification = Classification.BOOK;
        } else {
            break;
        }
    }

    // Generate SAN moves from all engine lines
    // This is used for the engine suggestions card on the frontend
    for (let position of positions) {
        for (let line of position.topLines) {
            if (line.evaluation.type == "mate" && line.evaluation.value == 0) continue;

            let board = new Chess(position.fen);

            try {
                line.moveSAN = board.move({
                    from: line.moveUCI.slice(0, 2),
                    to: line.moveUCI.slice(2, 4),
                    promotion: line.moveUCI.slice(4) || undefined
                }).san;
            } catch (err) {
                let cloudUCIFixes: { [key: string]: string } = {
                    "e8h8": "e8g8",
                    "e1h1": "e1g1",
                    "e8a8": "e8c8",
                    "e1a1": "e1c1"
                };
                line.moveUCI = cloudUCIFixes[line.moveUCI];
                if (!line.moveUCI) continue;

                line.moveSAN = board.move({
                    from: line.moveUCI.slice(0, 2),
                    to: line.moveUCI.slice(2, 4),
                    promotion: line.moveUCI.slice(4) || undefined
                }).san;
            }
        }
    }

    // Calculate computer accuracy percentages
    let whiteAccuracy = {
        current: 0,
        maximum: 0
    };
    let blackAccuracy = {
        current: 0,
        maximum: 0
    };

    for (let position of positions.slice(1)) {
        let moveColour = position.fen.includes(" b ") ? "white" : "black";

        if (moveColour == "white") {
            whiteAccuracy.current += classificationValues[position.classification!];
            whiteAccuracy.maximum += 6;
        } else {
            blackAccuracy.current += classificationValues[position.classification!];
            blackAccuracy.maximum += 6;
        }
    }

    // Return complete report
    return {
        accuracies: {
            white: parseInt((whiteAccuracy.current / whiteAccuracy.maximum * 100).toFixed(2)),
            black: parseInt((blackAccuracy.current / blackAccuracy.maximum * 100).toFixed(2))
        },
        positions: positions
    };

}

export default analyse;