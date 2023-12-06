class Position {
    fen = "";
    move = {
        san: "",
        uci: ""
    };
    evaluation = {
        type: "",
        value: 0,
        top: ""
    };
    classification = "";
}

module.exports = Position;