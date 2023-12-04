async function loadPiece(filename) {
    return new Promise(res => {
        let image = new Image();
        image.src = `/static/media/${filename}.svg`;

        image.addEventListener("load", () => {
            res(image);
        });
    });
}

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

let pieceImages = {};
let pieceLoaders = [];

for (let pieceId in pieceIds) {
    let pieceLoader = loadPiece(pieceId);

    pieceLoader.then(image => {
        pieceImages[pieceIds[pieceId]] = image;
    });

    pieceLoaders.push(pieceLoader);
}

Promise.all(pieceLoaders).then(() => {
    drawBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
});