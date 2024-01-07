import { Chess, Square } from "chess.js";

import {
    Classification, 
    centipawnClassifications, 
    classificationValues, 
    getEvaluationLossThreshold 
} from "./classification";
import { InfluencingPiece, getAttackers, isPieceHanging, pieceValues, promotions } from "./board";

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

        let previousEvaluation = topMove.evaluation;
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

        let absoluteEvaluation = evaluation.value * (moveColour == "white" ? 1 : -1);
        let previousAbsoluteValue = previousEvaluation.value * (moveColour == "white" ? 1 : -1);
        
        // Calculate evaluation loss as a result of this move
        let evalLoss = Infinity;
        let cutoffEvalLoss = Infinity;
        let lastLineEvalLoss = Infinity;

        let matchingTopLine = lastPosition.topLines.find(line => line.moveUCI == position.move.uci);
        if (matchingTopLine) {
            if (moveColour == "white") {
                lastLineEvalLoss = previousEvaluation.value - matchingTopLine.evaluation.value;
            } else {
                lastLineEvalLoss = matchingTopLine.evaluation.value - previousEvaluation.value;
            }
        }

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

        evalLoss = Math.min(evalLoss, cutoffEvalLoss, lastLineEvalLoss);

        // If this move was the only legal one, apply forced
        if (!secondTopMove) {
            position.classification = Classification.FORCED;
            continue;
        }

        let noMate = previousEvaluation.type == "cp" && evaluation.type == "cp";

        // If it is the top line, disregard other detections and give best
        if (topMove.moveUCI == position.move.uci) {
            position.classification = Classification.BEST;
        } else {
            // If no mate on the board last move and still no mate
            if (noMate) {
                for (let classif of centipawnClassifications) {
                    if (evalLoss <= getEvaluationLossThreshold(classif, previousEvaluation.value)) {
                        position.classification = classif;
                        break;
                    }
                }
            }

            // If no mate last move but you blundered a mate
            else if (previousEvaluation.type == "cp" && evaluation.type == "mate") {
                if (absoluteEvaluation > 0) {
                    position.classification = Classification.BEST;
                } else if (absoluteEvaluation >= -2) {
                    position.classification = Classification.BLUNDER;
                } else if (absoluteEvaluation >= -5) {
                    position.classification = Classification.MISTAKE;
                } else {
                    position.classification = Classification.INACCURACY;
                }
            }

            // If mate last move and there is no longer a mate
            else if (previousEvaluation.type == "mate" && evaluation.type == "cp") {
                if (previousAbsoluteValue < 0 && absoluteEvaluation < 0) {
                    position.classification = Classification.BEST;
                } else if (absoluteEvaluation >= 400) {
                    position.classification = Classification.GOOD;
                } else if (absoluteEvaluation >= 150) {
                    position.classification = Classification.INACCURACY;
                } else if (absoluteEvaluation >= -100) {
                    position.classification = Classification.MISTAKE;
                } else {
                    position.classification = Classification.BLUNDER;
                }
            }

            // If mate last move and forced mate still exists
            else if (previousEvaluation.type == "mate" && evaluation.type == "mate") {
                if (previousAbsoluteValue > 0) {
                    if (absoluteEvaluation <= -4) {
                        position.classification = Classification.MISTAKE;
                    } else if (absoluteEvaluation < 0) {
                        position.classification = Classification.BLUNDER
                    } else if (absoluteEvaluation < previousAbsoluteValue) {
                        position.classification = Classification.BEST;
                    } else if (absoluteEvaluation <= previousAbsoluteValue + 2) {
                        position.classification = Classification.EXCELLENT;
                    } else {
                        position.classification = Classification.GOOD;
                    }
                } else {
                    if (absoluteEvaluation == previousAbsoluteValue) {
                        position.classification = Classification.BEST;
                    } else {
                        position.classification = Classification.GOOD;
                    }
                }
            }

        }

        // If current verdict is best, check for possible brilliancy
        if (position.classification == Classification.BEST) {
            // Test for brilliant move classification
            // Must be winning for the side that played the brilliancy
            if (absoluteEvaluation > 0) {
                let lastBoard = new Chess(lastPosition.fen);
                let currentBoard = new Chess(position.fen);
                if (lastBoard.isCheck()) continue;

                let lastPiece = lastBoard.get(position.move.uci.slice(2, 4) as Square) || { type: "m" };

                let sacrificedPieces: InfluencingPiece[] = [];
                for (let row of currentBoard.board()) {
                    for (let piece of row) {
                        if (!piece) continue;
                        if (piece.color != moveColour.charAt(0)) continue;
                        if (piece.type == "k" || piece.type == "p") continue;

                        // If the piece just captured is of higher or equal value than the candidate
                        // hanging piece, not hanging, better trade happening somewhere else
                        if (pieceValues[lastPiece.type] >= pieceValues[piece.type]) {
                            continue;
                        }

                        // If the piece is otherwise hanging, brilliant
                        if (isPieceHanging(lastPosition.fen, position.fen, piece.square)) {
                            position.classification = Classification.BRILLIANT;
                            sacrificedPieces.push(piece);
                        }
                    }
                }

                // If all captures of all of your hanging pieces would result in an enemy piece
                // of greater or equal value also being hanging OR mate in 1, not brilliant
                if (!currentBoard.isCheck()) {
                    let anyPieceViablyCapturable = false;
                    let captureTestBoard = new Chess(position.fen);

                    for (let piece of sacrificedPieces) {
                        let attackers = getAttackers(position.fen, piece.square);

                        for (let attacker of attackers) {
                            for (let promotion of promotions) {
                                try {
                                    captureTestBoard.move({
                                        from: attacker.square,
                                        to: piece.square,
                                        promotion: promotion
                                    });

                                    // If the capture of the piece with the current attacker leads to
                                    // a piece of greater or equal value being hung (if attacker is pinned)
                                    let attackerPinned = false;
                                    for (let row of captureTestBoard.board()) {
                                        for (let enemyPiece of row) {
                                            if (!enemyPiece) continue;
                                            if (enemyPiece.color == captureTestBoard.turn() || enemyPiece.type == "k") continue;
                    
                                            if (
                                                isPieceHanging(lastPosition.fen, position.fen, enemyPiece.square)
                                                && pieceValues[enemyPiece.type] >= Math.max(...sacrificedPieces.map(sack => pieceValues[sack.type]))
                                                && !getAttackers(position.fen, enemyPiece.square).some(
                                                    atk => isPieceHanging(lastPosition.fen, position.fen, atk.square)
                                                )
                                            ) {
                                                attackerPinned = true;
                                                break;
                                            }
                                        }
                                        if (attackerPinned) break;
                                    }

                                    // If the capture of the piece leads to mate in 1
                                    if (!attackerPinned && !captureTestBoard.moves().some(move => move.endsWith("#"))) {
                                        anyPieceViablyCapturable = true;
                                        break;
                                    }

                                    captureTestBoard.undo();
                                } catch (err) {}
                            }

                            if (anyPieceViablyCapturable) break;
                        }

                        if (anyPieceViablyCapturable) break;
                    }

                    if (!anyPieceViablyCapturable) {
                        position.classification = Classification.BEST;
                    }
                }
            }

            // Test for great move classification
            if (
                noMate
                && position.classification != Classification.BRILLIANT
                && lastPosition.classification == Classification.BLUNDER
                && Math.abs(topMove.evaluation.value - secondTopMove.evaluation.value) >= 150
            ) {
                position.classification = Classification.GREAT;
            }
        }

        // Do not allow blunder if move still completely winning
        if (position.classification == Classification.BLUNDER && absoluteEvaluation >= 600) {
            position.classification = Classification.GOOD;
        }

        // Do not allow blunder if you were already in a completely lost position
        if (position.classification == Classification.BLUNDER && previousAbsoluteValue <= -600) {
            position.classification = Classification.GOOD;
        }

        position.classification ??= Classification.BOOK;

    }

    // Generate opening names for named positions
    for (let position of positions) {
        let opening = openings.find(opening => position.fen.includes(opening.fen));
        position.opening = opening?.name;
    }

    // Apply book moves for cloud evaluations and named positions
    let positiveClassifs = centipawnClassifications.slice(0, 2);
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

            line.moveSAN = board.move({
                from: line.moveUCI.slice(0, 2),
                to: line.moveUCI.slice(2, 4),
                promotion: line.moveUCI.slice(4) || undefined
            }).san;
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