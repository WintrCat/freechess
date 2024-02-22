const bestClassifications = [
    "brilliant",
    "great",
    "best",
    "book",
    "forced"
];

function updateClassificationMessage(lastPosition: Position, position: Position) {

    if (position.classification) {
        let classificationMessages: { [key: string]: string } = {
            "great": translateIntoUserLanguage(userLanguage,"a great move"),
            "good": translateIntoUserLanguage(userLanguage,"an okay move"),
            "inaccuracy": translateIntoUserLanguage(userLanguage,"an inaccuracy"),
            "mistake": translateIntoUserLanguage(userLanguage,"a mistake"),
            "blunder": translateIntoUserLanguage(userLanguage,"a blunder"),
            "book": translateIntoUserLanguage(userLanguage,"theory"),
            "best": translateIntoUserLanguage(userLanguage, "best"),
            "brilliant": translateIntoUserLanguage(userLanguage, "brilliant"),
            "forced": translateIntoUserLanguage(userLanguage, "forced")
        };

        $("#classification-icon").attr("src", `/static/media/${position.classification}.png`);

        let message = classificationMessages[position.classification] ?? position.classification;
        $("#classification-message").html(`${position.move?.san} ${translateIntoUserLanguage(userLanguage,"is")} ${message}`);
        $("#classification-message").css("color", classificationColours[position.classification]);

        $("#classification-message-container").css("display", "flex");

        if (bestClassifications.includes(position.classification)) {
            $("#top-alternative-message").css("display", "none");
        } else {
            let topAlternative = lastPosition.topLines?.[0].moveSAN;
            if (!topAlternative) return;

            $("#top-alternative-message").html(`${translateIntoUserLanguage(userLanguage,"Best was")} ${topAlternative}`);
            $("#top-alternative-message").css("display", "inline");
        }
    } else {
        $("#classification-message-container").css("display", "none");
        $("#top-alternative-message").css("display", "none");
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

$("#save-analysis-button").on("click", () => {

    let savedAnalysis = {
        players: {
            white: whitePlayer,
            black: blackPlayer
        },
        results: reportResults
    };

    let reportBlob = new Blob([JSON.stringify(savedAnalysis)], {"type": "application/json"});

    open(URL.createObjectURL(reportBlob));

});