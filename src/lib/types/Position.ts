import { Classification } from "../classification.js";
import { EngineLine, Evaluation } from "./Engine.js";

interface Move {
    san: string;
    uci: string;
}

export interface Position {
    fen: string;
    move?: Move;
}

export interface EvaluatedPosition extends Position {
    move: Move;
    topLines: EngineLine[];
    cutoffEvaluation?: Evaluation;
    classification?: Classification;
    opening?: string;
    worker: string;
}

export interface Opening {
    name: string;
    fen: string;
}
