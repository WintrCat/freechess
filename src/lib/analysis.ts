import { EvaluatedPosition } from "./types/Position";

async function analyse(positions: EvaluatedPosition[]): Promise<any> {
    
    for (let position of positions) {
        position.classification = [
            "brilliant",
            "great",
            "best",
            "excellent",
            "good",
            "inaccuracy",
            "mistake",
            "blunder",
            "forced",
            "book"
        ][Math.round(Math.random() * 9)];

        
    }

    return positions;

}

export default analyse;