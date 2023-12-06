const Position = require("./position");

/**
 * @param {Position[]} positions 
 */
async function analyse(positions) {
    
    let positionIndex = 1;
    for (let position of positions.slice(1)) {

        let lastPosition = positions[positionIndex - 1];
        
        let evalLoss = lastPosition.evaluation.value - position.evaluation.value;

        // For black moves, eval loss inverted
        if (lastPosition.fen.includes(" b ")) evalLoss *= -1;

        // Pick classification from eval loss
        if (evalLoss < 10 || position.move.uci == lastPosition.evaluation.top) {
            position.classification = "best";
        } else if (evalLoss < 50) {
            position.classification = "excellent";
        } else if (evalLoss < 120) {
            position.classification = "good";
        } else if (evalLoss < 180) {
            position.classification = "inaccuracy";
        } else if (evalLoss < 270) {
            position.classification = "mistake";
        } else {
            position.classification = "blunder";
        }

        positionIndex++;

    }

    return positions;

}

module.exports = analyse;