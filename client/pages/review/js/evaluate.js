const wasmSupported = typeof WebAssembly == "object";

function runStockfishWorker() {

    let stockfish = new Worker("/static/scripts/stockfish" + (wasmSupported ? ".wasm.js" : ".js"));

    stockfish.addEventListener("message", event => {

        let message = event.data;

        console.log(message);

        if (message.startsWith("info depth 18")) {
            console.log("Time elapsed: " + ((Date.now() - startTime) / 1000) + "s");
        }

    });

    stockfish.postMessage("uci");

    stockfish.postMessage("setoption name Threads value 4");

    let startTime = Date.now();
    stockfish.postMessage("go depth 18");

}

for (let i = 0; i < 16; i++) {
    runStockfishWorker();
}