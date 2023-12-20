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
    worker?: Stockfish | { depth: number }
}

interface UCIMove {
    from: Coordinate,
    to: Coordinate
}

interface ParseResponse {
    success: boolean,
    message?: string,
    positions?: Position[]
}

interface ReportResponse {
    success: boolean,
    message?: string,
    results?: Position[]
}