const webAssemblyModifier = typeof WebAssembly == "object" ? ".wasm.js" : ".js";

class Stockfish {

    _worker = new Worker("/static/scripts/stockfish" + webAssemblyModifier);

    depth = 0;

    constructor() {
        this._worker.postMessage("uci");
    }

    /**
     * @param {string} fen FEN position to evaluate
     * @param {number} depth Search depth
     */
    async evaluate(fen, targetDepth) {
        this._worker.postMessage("position fen " + fen);
        this._worker.postMessage("go depth " + targetDepth);

        return new Promise((res, rej) => {
            this._worker.addEventListener("message", event => {
                let message = event.data;

                if (!message.startsWith("info depth")) return;
                this.depth = parseInt(message.match(/(?<=info depth )\d+/)[0]);

                let evaluationType = / cp /g.test(message) ? "cp" : "mate";
                let evaluationScore = parseInt(message.match(/(?<=[cp|mate] )[\d-]+/g)[0]);

                if (fen.includes(" b ") && evaluationScore != 0) {
                    evaluationScore *= -1;
                }

                if (this.depth == targetDepth || (evaluationType == "mate" && evaluationScore == 0)) {
                    this._worker.terminate();
                    res({
                        type: evaluationType,
                        value: evaluationScore
                    });
                }      
            });
        });
    }

}