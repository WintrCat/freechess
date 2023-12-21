const webAssemblyModifier = typeof WebAssembly == "object" ? ".wasm.js" : ".js";

class Stockfish {

    private worker = new Worker("/static/scripts/stockfish" + webAssemblyModifier);

    depth = 0;

    constructor() {
        this.worker.postMessage("uci");
        this.worker.postMessage("setoption name MultiPV value 2")
    }

    async evaluate(fen: string, targetDepth: number, verbose: boolean = false): Promise<EngineLine[]> {
        this.worker.postMessage("position fen " + fen);
        this.worker.postMessage("go depth " + targetDepth);

        const messages: string[] = [];
        const lines: EngineLine[] = [];

        return new Promise(res => {
            this.worker.addEventListener("message", event => {
                let message: string = event.data;
                messages.unshift(message);

                if (verbose) console.log(message);

                // Get latest depth for progress monitoring
                let latestDepth = parseInt(message.match(/(?<=depth )\d+/)?.[0] || "0");
                this.depth = Math.max(latestDepth, this.depth);

                // Best move or checkmate log indicates end of search
                if (message.startsWith("bestmove") || message.includes("mate 0")) {            
                    let searchMessages = messages.filter(msg => msg.startsWith("info depth"));

                    for (let searchMessage of searchMessages) {
                        // Extract depth, MultiPV line ID and evaluation from search message
                        let lineIDString = searchMessage.match(/(?<=multipv )\d+/)?.[0];
                        let depthString = searchMessage.match(/(?<=depth )\d+/)?.[0];
                        let moveUCI = searchMessage.match(/(?<= pv ).+?(?= |$)/)?.[0];
                        let evaluation: Evaluation = {
                            type: searchMessage.includes(" cp ") ? "cp" : "mate",
                            value: parseInt(searchMessage.match(/(?:(?<=cp )|(?<=mate ))[\d-]+/)?.[0] || "0")
                        };

                        // Invert evaluation if black to play since scores are from black perspective
                        // and we want them always from the perspective of white
                        if (fen.includes(" b ")) {
                            evaluation.value *= -1;
                        }

                        // If any piece of data from message is missing, discard message
                        if (!lineIDString || !depthString || !moveUCI) continue;

                        let lineID = parseInt(lineIDString);
                        let depth = parseInt(depthString);

                        // Discard if target depth not reached or lineID already present
                        if (depth != targetDepth || lines.some(line => line.lineID == lineID)) continue;
                        
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

}