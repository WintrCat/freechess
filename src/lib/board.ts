import { Chess, Square } from "chess.js";

interface Coordinate {
    x: number,
    y: number
}

export interface InfluencingPiece {
    square: Square,
    color: string,
    type: string
}

export const promotions = [undefined, "b", "n", "r", "q"];

export const pieceValues: { [key: string]: number } = {
    "p": 1,
    "n": 3,
    "b": 3,
    "r": 5,
    "q": 9,
    "k": Infinity,
    "m": 0
};

function getBoardCoordinates(square: Square): Coordinate {
    return {
        x: "abcdefgh".indexOf(square.slice(0, 1)),
        y: parseInt(square.slice(1)) - 1
    };
}

function getSquare(coordinate: Coordinate): Square {
    return "abcdefgh".charAt(coordinate.x) + (coordinate.y + 1).toString() as Square;
}

export function getAttackers(fen: string, square: Square): InfluencingPiece[] {

    let attackers: InfluencingPiece[] = [];

    let board = new Chess(fen);
    let piece = board.get(square);

    // Set colour to move to opposite of attacked piece
    board.load(fen
        .replace(/(?<= )(?:w|b)(?= )/g, piece.color == "w" ? "b" : "w")
        .replace(/ [a-h][1-8] /g, " - ")
    );

    // Find each legal move that captures attacked piece
    let legalMoves = board.moves({ verbose: true });

    for (let move of legalMoves) {
        if (move.to == square) {
            attackers.push({
                square: move.from,
                color: move.color,
                type: move.piece
            });
        }
    }

    // If there is an opposite king around the attacked piece add him as an attacker
    // if he is not the only attacker or it is a legal move for the king to capture it
    let oppositeKing: InfluencingPiece | undefined;
    let oppositeColour = piece.color == "w" ? "b" : "w";

    let pieceCoordinate = getBoardCoordinates(square);
    for (let xOffset = -1; xOffset <= 1; xOffset++) {
        for (let yOffset = -1; yOffset <= 1; yOffset++) {
            if (xOffset == 0 && yOffset == 0) continue;

            let offsetSquare = getSquare({
                x: Math.min(Math.max(pieceCoordinate.x + xOffset, 0), 7),
                y: Math.min(Math.max(pieceCoordinate.y + yOffset, 0), 7)
            });
            let offsetPiece = board.get(offsetSquare);
            if (!offsetPiece) continue;

            if (offsetPiece.color == oppositeColour && offsetPiece.type == "k") {
                oppositeKing = {
                    color: offsetPiece.color,
                    square: offsetSquare,
                    type: offsetPiece.type
                };
                break;
            }
        }
        if (oppositeKing) break;
    }

    if (!oppositeKing) return attackers;

    let kingCaptureLegal = false;
    try {
        board.move({
            from: oppositeKing.square,
            to: square
        });

        kingCaptureLegal = true;
    } catch {}

    if (oppositeKing && (attackers.length > 0 || kingCaptureLegal)) {
        attackers.push(oppositeKing);
    }

    return attackers;

}

export function getDefenders(fen: string, square: Square) {

    let board = new Chess(fen);
    let piece = board.get(square);
    let testAttacker = getAttackers(fen, square)[0];

    // If there is an attacker we can test capture the piece with
    if (testAttacker) {
        // Set player to move to colour of test attacker
        board.load(fen
            .replace(/(?<= )(?:w|b)(?= )/g, testAttacker.color)
            .replace(/ [a-h][1-8] /g, " - ")
        );

        // Capture the defended piece with the test attacker
        for (let promotion of promotions) {
            try {
                board.move({
                    from: testAttacker.square,
                    to: square,
                    promotion: promotion
                });

                // Return the attackers that can now capture the test attacker
                return getAttackers(board.fen(), square);
            } catch {}
        }
    } else {
        // Set player to move to defended piece colour
        board.load(fen
            .replace(/(?<= )(?:w|b)(?= )/g, piece.color)
            .replace(/ [a-h][1-8] /g, " - ")
        );

        // Replace defended piece with an enemy queen
        board.put({
            color: piece.color == "w" ? "b" : "w",
            type: "q"
        }, square);

        // Return the attackers of that piece
        return getAttackers(board.fen(), square);
    }

    return [];

}

export function isPieceHanging(lastFen: string, fen: string, square: Square) {

    let lastBoard = new Chess(lastFen);
    let board = new Chess(fen);

    let lastPiece = lastBoard.get(square);
    let piece = board.get(square);

    let attackers = getAttackers(fen, square);
    let defenders = getDefenders(fen, square);

    // If piece was just traded equally or better, not hanging
    if (pieceValues[lastPiece.type] >= pieceValues[piece.type] && lastPiece.color != piece.color) {
        return false;
    }

    // If a rook took a minor piece that was only defended by one other
    // minor piece, it was a favourable rook exchange, so rook not hanging
    if (
        piece.type == "r"
        && pieceValues[lastPiece.type] == 3 
        && attackers.every(atk => pieceValues[atk.type] == 3)
        && attackers.length == 1
    ) {
        return false;
    }

    // If piece has an attacker of lower value, hanging
    if (attackers.some(atk => pieceValues[atk.type] < pieceValues[piece.type])) {
        return true;
    }

    if (attackers.length > defenders.length) {
        let minAttackerValue = Infinity;
        for (let attacker of attackers) {
            minAttackerValue = Math.min(pieceValues[attacker.type], minAttackerValue);
        }
        
        // If taking the piece even though it has more attackers than defenders
        // would be a sacrifice in itself, not hanging
        if (
            pieceValues[piece.type] < minAttackerValue 
            && defenders.some(dfn => pieceValues[dfn.type] < minAttackerValue)
        ) {
            return false;
        }

        // If any of the piece's defenders are pawns, then the sacrificed piece
        // is the defending pawn. The least valuable attacker is equal in value
        // to the sacrificed piece at this point of the logic
        if (defenders.some(dfn => pieceValues[dfn.type] == 1)) {
            return false;
        }

        return true;
    }

    return false;

}