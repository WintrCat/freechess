import { EvaluatedPosition } from "./Position.js";

export default interface Report {
    accuracies: {
        white: number;
        black: number;
    };
    positions: EvaluatedPosition[];
}
