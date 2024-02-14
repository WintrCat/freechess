import { Stockfish } from "./engine.js";
import { Classification } from "./classificationLogic/classification.js";

export declare class grecaptcha {
    static reset(): void;
    static getResponse(): string;
}

export interface Profile {
    username: string;
    rating: string;
}

export interface Game {
    white: Profile;
    black: Profile;
    timeClass: string;
    pgn: string;
}

export interface Coordinate {
    x: number;
    y: number;
}

export interface Move {
    san: string;
    uci: string;
}

export interface Evaluation {
    type: "cp" | "mate";
    value: number;
}

export interface EngineLine {
    id: number;
    depth: number;
    evaluation: Evaluation;
    moveUCI: string;
    moveSAN?: string;
}

export interface Position {
    fen: string;
    move?: Move;
    topLines?: EngineLine[];
    cutoffEvaluation?: Evaluation;
    worker?: Stockfish | string;
    classification?: Classification;
    opening?: string;
}

export interface Report {
    accuracies: {
        white: number;
        black: number;
    };
    positions: Position[];
}

export interface SavedAnalysis {
    results: Report;
    players: {
        white: Profile;
        black: Profile;
    };
}

export interface ParseResponse {
    message?: string;
    positions?: Position[];
}

export interface ReportResponse {
    message?: string;
    results?: Report;
}
