import { Classification } from "../classification";
import { EngineLine } from "./Engine";

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
    topLines: EngineLine[],
    classification?: Classification,
    worker: string
}