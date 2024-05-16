declare class grecaptcha {
    static reset(): void;
    static getResponse(): string;
}

interface Profile {
    username: string,
    rating: string,
    aiLevel?: string
}

interface Game {
    white: Profile,
    black: Profile,
    timeClass: string,
    pgn: string
}

interface Coordinate {
    x: number,
    y: number
}

interface Move {
    san: string,
    uci: string
}

interface Evaluation {
    type: string,
    value: number
}

interface EngineLine {
    id: number,
    depth: number,
    evaluation: Evaluation,
    moveUCI: string,
    moveSAN?: string
}

interface Position {
    fen: string,
    move?: Move,
    topLines?: EngineLine[],
    cutoffEvaluation?: Evaluation,
    worker?: Stockfish | string
    classification?: string,
    opening?: string
}

type Classifications = 
    "brilliant" |
    "great"|
    "best"|
    "excellent"|
    "good"|
    "inaccuracy"|
    "mistake"|
    "blunder"|
    "book"|
    "forced";

interface ClassificationCount extends Record<Classifications, number> {}


interface Report {
    accuracies: {
        white: number,
        black: number
    },
    classifications: {
        white: ClassificationCount,
        black: ClassificationCount
    },
    positions: Position[]
}

interface SavedAnalysis {
    results: Report,
    players: {
        white: Profile,
        black: Profile
    }
}

interface ParseResponse {
    message?: string,
    positions?: Position[]
}

interface ReportResponse {
    message?: string,
    results?: Report 
}
