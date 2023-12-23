import { EvaluatedPosition } from "./Position"

export default interface Report {
    accuracies: {
        white: number,
        black: number
    },
    positions: EvaluatedPosition[]
}