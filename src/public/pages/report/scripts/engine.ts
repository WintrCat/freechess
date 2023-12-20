const webAssemblyModifier = typeof WebAssembly == "object" ? ".wasm.js" : ".js";

class Stockfish {

    private worker = new Worker("/static/scripts/stockfish" + webAssemblyModifier);

    depth = 0;

    constructor() {
        this.worker.postMessage("uci");
        this.worker.postMessage("setoption name MultiPV value 2")
    }

    async evaluate(fen: string, targetDepth: number): Promise<EngineLine[]> {
        this.worker.postMessage("position fen " + fen);
        this.worker.postMessage("go depth " + targetDepth);

        const messages: string[] = [];
        const lines: EngineLine[] = [];

        return new Promise(res => {
            this.worker.addEventListener("message", event => {
                let message: string = event.data;
                messages.unshift(message);

                // Best move log indicates end of search
                if (message.startsWith("bestmove")) {            
                    let searchMessages = messages.filter(msg => msg.startsWith("info depth"));

                    for (let searchMessage of searchMessages) {
                        // Extract depth, MultiPV line ID and evaluation from search message
                        let lineIDString = searchMessage.match(/(?<=multipv )\d+/)?.[0];
                        let depthString = searchMessage.match(/(?<=depth )\d+/)?.[0];
                        let moveUCI = searchMessage.match(/(?<= pv ).+?(?= )/)?.[0];
                        let evaluation: Evaluation = {
                            type: searchMessage.includes(" cp ") ? "cp" : "mate",
                            value: parseInt(searchMessage.match(/(?<=(cp|mate) )\d+/)?.[0] || "0")
                        };

                        // If any piece of data from message is missing, discard message
                        if (!lineIDString || !depthString || !moveUCI) continue;

                        // Add engine line data to lines list
                        let lineID = parseInt(lineIDString);
                        let depth = parseInt(depthString);
                        
                        lines.push({
                            lineID,
                            depth,
                            moveUCI,
                            evaluation
                        });
                    }

                    res(lines);
                }
            });
        });
    }

    // async evaluate(fen: string, targetDepth: number): Promise<Evaluation> {
    //     this._worker.postMessage("position fen " + fen);
    //     this._worker.postMessage("go depth " + targetDepth);

    //     return new Promise(res => {
    //         this._worker.addEventListener("message", event => {
    //             let message: string = event.data;

    //             if (!message.startsWith("info depth")) return;

    //             this.depth = parseInt(message.match(/(?<=info depth )\d+/)?.[0]?.toString()!);

    //             const evaluationType = message.includes(" cp ") ? "cp" : "mate";
    //             let evaluationScore = parseInt(message.match(/(?<=[cp|mate] )[\d-]+/g)?.[0]?.toString()!);

    //             if (fen.includes(" b ") && evaluationScore != 0) {
    //                 evaluationScore *= -1;
    //             }

    //             if (this.depth == targetDepth || (evaluationType == "mate" && evaluationScore == 0)) {
    //                 this._worker.terminate();
    //                 res({
    //                     type: evaluationType,
    //                     value: evaluationScore,
    //                 });
    //             }      
    //         });
    //     });
    // }

}