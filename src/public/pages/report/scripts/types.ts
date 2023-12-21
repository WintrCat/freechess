declare class grecaptcha {
    static reset(): void;
    static getResponse(): string;
}

interface Profile {
    username: string,
    rating: string
}

interface Coordinate {
    x: number,
    y: number
}

interface UCIMove {
    from: Coordinate,
    to: Coordinate
}

interface Evaluation {
    type: "cp" | "mate",
    value: number
}

interface Position {
    fen: string,
    move?: {
        san: string,
        uci: string
    },
    evaluation?: Evaluation,
    classification?: string,
    worker?: Stockfish | string
}

interface EngineLine {
    lineID: number,
    depth: number,
    evaluation: Evaluation,
    moveUCI: string
}

interface ParseResponse {
    message?: string,
    positions?: Position[]
}

interface ReportResponse {
    message?: string,
    results?: Position[]
}