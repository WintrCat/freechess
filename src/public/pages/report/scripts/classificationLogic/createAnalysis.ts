import { parse as parsePGN, ParsedPGN } from "pgn-parser";
import { Chess, Move } from "chess.js";
import { Position, EvaluatedPosition } from "./types/Position";
import Report from "./types/Report";
import analyse from "./analysis";

// #region ParsePGNToPositions

export async function positionsFromPGN(pgn?: string): Promise<Position[]> {
    if (!pgn) throw new Error("PGN not provided to parse");

    const parsedPGN: ParsedPGN = PGNToJSON(pgn);
    const positions: Position[] = generatePositions(parsedPGN);

    return positions;
}

function PGNToJSON(pgn: string): ParsedPGN {
    const [parsedPGN] = parsePGN(pgn);

    if (!parsedPGN) {
        throw new Error("Failed to parse PGN");
    }

    return parsedPGN;
}

function generatePositions(moves: ParsedPGN): Position[] {
    const board = new Chess();
    const positions: Position[] = [];
    positions.push({ fen: board.fen() });

    for (const pgnMove of moves.moves) {
        const moveSAN = pgnMove.move;
        const virtualBoardMove = makeVirtualBoardMove(board, moveSAN);
        const moveUCI = virtualBoardMove.from + virtualBoardMove.to;
        positions.push({
            fen: board.fen(),
            move: { san: moveSAN, uci: moveUCI },
        });
    }

    return positions;
}

// Checks if a move can be made. If it can be made
// the move is returned
function makeVirtualBoardMove(board: Chess, moveSAN: string): Move {
    try {
        const virtualMove = board.move(moveSAN);
        return virtualMove;
    } catch (err) {
        throw new Error("PGN contains illegal moves");
    }
}

// #endregion

// #region GenerateReport

export async function GenerateReport(
    positions: EvaluatedPosition[]
): Promise<Report> {
    try {
        const results = await analyse(positions);
        return results;
    } catch (err) {
        throw new Error("Failed to generate report");
    }
}

// #endregion
