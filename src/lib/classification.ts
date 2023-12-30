export enum Classification {
    BRILLIANT = "brilliant",
    GREAT = "great",
    BEST = "best",
    EXCELLENT = "excellent",
    GOOD = "good",
    INACCURACY = "inaccuracy",
    MISTAKE = "mistake",
    BLUNDER = "blunder",
    BOOK = "book",
    FORCED = "forced"
}

export const classificationValues = {
    "blunder": 1,
    "mistake": 2,
    "inaccuracy": 3,
    "good": 4,
    "excellent": 5,
    "best": 6,
    "great": 6,
    "brilliant": 6,
    "book": 6,
    "forced": 6
}

// Classification types with no special rules
export const centipawnClassifications = [
    Classification.BEST,
    Classification.EXCELLENT,
    Classification.GOOD,
    Classification.INACCURACY,
    Classification.MISTAKE,
    Classification.BLUNDER
];

// WTF Algorithm
// Get the maximum evaluation loss for a classification to be applied
// Evaluation loss threshold for excellent in a previously equal position is 30
export function getEvaluationLossThreshold(classif: Classification, prevEval: number) {

    prevEval = Math.abs(prevEval);

    switch (classif) {
        case Classification.BEST:
            return Math.pow(0.000018 * prevEval, 2) + (0.082 * prevEval) - 1.6364;
        case Classification.EXCELLENT:
            return Math.pow(0.0002 * prevEval, 2) + (0.1231 * prevEval) + 27.5455;
        case Classification.GOOD:
            return Math.pow(0.0002 * prevEval, 2) + (0.2643 * prevEval) + 60.5455;
        case Classification.INACCURACY:
            return Math.pow(0.0002 * prevEval, 2) + (0.3624 * prevEval) + 108.0909;
        case Classification.MISTAKE:
            return Math.pow(0.0003 * prevEval, 2) + (0.4027 * prevEval) + 225.8182;
        default:
            return Infinity;
    }

}