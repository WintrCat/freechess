import { ClassificationCount } from "./Classification"
import { EvaluatedPosition } from "./Position"

export default interface Report {
    accuracies: {
        white: number,
        black: number
    },
    classifications: {
        white: ClassificationCount,
        black: ClassificationCount,
    }
    positions: EvaluatedPosition[]
}