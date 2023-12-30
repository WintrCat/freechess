function updateClassificationMessage(position: Position) {

    if (position.classification) {
        let classificationMessages: { [key: string]: string } = {
            "great": "a great move",
            "inaccuracy": "an inaccuracy",
            "mistake": "a mistake",
            "blunder": "a blunder",
            "book": "a book move"
        };

        $("#classification-icon").attr("src", `/static/media/${position.classification}.png`);

        let message = classificationMessages[position.classification] ?? position.classification;
        $("#classification-message").html(`${position.move?.san} is ${message}`);
        $("#classification-message").css("color", classificationColours[position.classification]);
    } else {
        $("#classification-icon").attr("src", "");
        $("#classification-message").html("");
    }

}

function updateEngineSuggestions(lines: EngineLine[]) {

    $(".engine-suggestion").remove();
    $("#engine-suggestions-title").css("display", "block");

    for (let line of lines.sort((a, b) => a.id - b.id)) {
        let engineSuggestion = $<HTMLDivElement>("<div>");
        engineSuggestion.addClass("engine-suggestion");

        let evaluation = $("<b>");
        if (line.evaluation.type == "cp") {
            evaluation.html(Math.abs(line.evaluation.value / 100).toFixed(2));
        } else if (line.evaluation.value == 0) {
            $("#engine-suggestions-title").css("display", "none");
            break;
        } else {
            evaluation.html("M" + Math.abs(line.evaluation.value).toString());
        }
        evaluation.css("background-color", line.evaluation.value >= 0 ? "#ffffff" : "var(--primary-color)");
        evaluation.css("color", line.evaluation.value >= 0 ? "var(--primary-color)" : "#ffffff");

        let move = $("<span>");
        move.addClass("white");
        move.html(line.moveSAN ?? line.moveUCI);

        engineSuggestion.append(evaluation, move);
        $("#engine-suggestions").append(engineSuggestion);
    }

}