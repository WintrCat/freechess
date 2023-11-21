const wasmSupported = typeof WebAssembly == "object";

/**
 * @param {(message: string) => void} onMessage
 * @description Creates and returns a Stockfish web worker with a custom message listener
 */
function createStockfishWorker(onMessage) {

    let stockfish = new Worker("/static/scripts/stockfish" + (wasmSupported ? ".wasm.js" : ".js"));

    stockfish.addEventListener("message", event => onMessage(event.data));
    stockfish.postMessage("uci");
    
    return stockfish;

}