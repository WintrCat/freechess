export interface Evaluation {
    type: "cp" | "mate",
    value: number
}

export interface EngineLine {
    id: number,
    depth: number,
    evaluation: Evaluation,
    moveUCI: string,
    moveSAN?: string
}