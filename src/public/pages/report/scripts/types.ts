declare class grecaptcha {
    static reset(): void;
    static getResponse(): string;
}

interface Profile {
    username: string,
    rating: string
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
    type: "cp" | "mate",
    value: number
}

interface EngineLine {
    id: number,
    depth: number,
    evaluation: Evaluation,
    moveUCI: string
}

interface Position {
    fen: string,
    move?: Move,
    topLines?: EngineLine[],
    worker?: Stockfish | string
    classification?: string
}

interface ParseResponse {
    message?: string,
    positions?: Position[]
}

interface ReportResponse {
    message?: string,
    results?: Position[]
}