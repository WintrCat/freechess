import { Evaluation, EngineLine } from "./Engine";

interface Move {
    san: string,
    uci: string
}

export interface Position {
    fen: string,
    move?: Move
}

export interface EvaluatedPosition extends Position {
    move: Move,
    evaluation: Evaluation,
    topLines: EngineLine[],
    classification?: string
}