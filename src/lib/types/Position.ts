export default interface Position {
    fen: string,
    move?: {
        san: string,
        uci: string,
    },
    evaluation?: {
        type: "cp" | "mate",
        value: number
    },
    classification?: string
}