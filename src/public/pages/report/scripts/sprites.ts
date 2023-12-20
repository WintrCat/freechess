async function loadSprite(filename: string): Promise<HTMLImageElement> {
    return new Promise(res => {
        let image = new Image();
        image.src = "/static/media/" + filename;

        image.addEventListener("load", () => {
            res(image);
        });
    });
}

// Load piece assets
const pieceIds = {
    "white_pawn": "P",
    "white_knight": "N",
    "white_bishop": "B",
    "white_rook": "R",
    "white_queen": "Q",
    "white_king": "K",
    "black_pawn": "p",
    "black_knight": "n",
    "black_bishop": "b",
    "black_rook": "r",
    "black_queen": "q",
    "black_king": "k"
};

let pieceImages: {[key: string]: HTMLImageElement} = {};
let pieceLoaders: Promise<HTMLImageElement>[] = [];

for (let [ pieceId, pieceFenCharacter ] of Object.entries(pieceIds)) {
    let pieceLoader = loadSprite(pieceId + ".svg");

    pieceLoader.then(image => {
        pieceImages[pieceFenCharacter] = image;
    });

    pieceLoaders.push(pieceLoader);
}

// Load classification icon assets
const classificationIcons: {[key: string]: HTMLImageElement | null} = {
    "brilliant": null,
    "great": null,
    "best": null,
    "excellent": null,
    "good": null,
    "inaccuracy": null,
    "mistake": null,
    "blunder": null,
    "forced": null,
    "book": null
};

for (let classification in classificationIcons) {
    loadSprite(classification + ".png").then(image => {
        classificationIcons[classification] = image;
    });
}