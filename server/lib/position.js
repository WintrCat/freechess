class Position {
    fen = "";
    move = {
        san: "",
        uci: ""
    };
    evaluation = {
        type: "",
        value: 0
    };
}

module.exports = Position;