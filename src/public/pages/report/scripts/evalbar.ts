const evaluationBar = document.querySelector("#evaluation-bar") as SVGElement;
const whiteRect = document.querySelector("#white-rect") as SVGRectElement;
const blackRect = document.querySelector("#black-rect") as SVGRectElement;
const whiteEvalText = document.querySelector("#white-eval-text") as SVGTextElement;
const blackEvalText = document.querySelector("#black-eval-text") as SVGTextElement;

const totalHeight = evaluationBar.clientHeight;

function setEvalBarToWinner(winnerPlayer: "white" | "black") {
    if (boardFlipped) {
        if (winnerPlayer === "black") {
            whiteRect.setAttribute("y", "0");
            whiteRect.setAttribute("height", "730");
            blackRect.setAttribute("height", "0");
        } else {
            whiteRect.setAttribute("y", "730");
            whiteRect.setAttribute("height", "0");
            blackRect.setAttribute("height", "730");
        }
    } else {
        if (winnerPlayer === "black") {
            whiteRect.setAttribute("y", "730");
            whiteRect.setAttribute("height", "0");
            blackRect.setAttribute("height", "730");
        } else {
            whiteRect.setAttribute("y", "0");
            whiteRect.setAttribute("height", "730");
            blackRect.setAttribute("height", "0");
        }
    }
}

function setEvalTextVisible(visiblePlayer: "white" | "black") {
    if (visiblePlayer === "white") {
        whiteEvalText.setAttribute("visibility", boardFlipped ? "hidden" : "visible");
        blackEvalText.setAttribute("visibility", boardFlipped ? "visible" : "hidden");
        whiteEvalText.setAttribute("fill", boardFlipped ? "#fff" : "#000");
        blackEvalText.setAttribute("fill", boardFlipped ? "#000" : "#fff");
    } else {
        whiteEvalText.setAttribute("visibility", boardFlipped ? "visible" : "hidden");
        blackEvalText.setAttribute("visibility", boardFlipped ? "hidden" : "visible");
        whiteEvalText.setAttribute("fill", boardFlipped ? "#000" : "#fff");
        blackEvalText.setAttribute("fill", boardFlipped ? "#fff" : "#000");
    }
}

async function drawEvaluationBar(evaluation: Evaluation, boardFlipped: boolean, movedPlayer: "white" | "black") {
    const blackHeight = Math.max(Math.min(totalHeight / 2 - evaluation.value / 3, totalHeight), 0);
    const whiteHeight = Math.max(Math.min(totalHeight / 2 + evaluation.value / 3, totalHeight), 0);

    let evaluationText: string;
    let isCheckmated: boolean = false;
    if (evaluation.type === "cp") {
        evaluationText = (Math.abs(evaluation.value) / 100).toFixed(1);
        whiteRect.setAttribute("y", boardFlipped ? whiteHeight.toString() : blackHeight.toString());
        whiteRect.setAttribute("height", boardFlipped ? blackHeight.toString() : whiteHeight.toString());
        blackRect.setAttribute("height", boardFlipped ? whiteHeight.toString() : blackHeight.toString());
    } else {
        // When checkmate steps 
        evaluationText = "M" + Math.abs(evaluation.value).toString();
        if (evaluation.value === 0) {
            isCheckmated = true;
            evaluationText = movedPlayer === "white" ? "1-0" : "0-1";
        }

        // Set eval bar for winner
        if (evaluation.value > 0) {
            setEvalBarToWinner("white");
        } else if (evaluation.value < 0) {
            setEvalBarToWinner("black");
        } else if (evaluation.value === 0) {
            setEvalBarToWinner(movedPlayer);
        }
    }
    whiteEvalText.textContent = evaluationText;
    blackEvalText.textContent = evaluationText;

    // Set eval text visibility
    if (isCheckmated) {
        setEvalTextVisible(movedPlayer);
    } else if (evaluation.value >= 0) {
        setEvalTextVisible("white");
    } else {
        setEvalTextVisible("black");
    }

    // Fill evalbar with isBoardFlipped
    if (boardFlipped) {
        whiteEvalText.setAttribute("fill", "#fff");
        blackEvalText.setAttribute("fill", "#000");
        whiteRect.setAttribute("fill", "#000000");
        blackRect.setAttribute("fill", "#ffffff");
    } else {
        whiteEvalText.setAttribute("fill", "#000");
        blackEvalText.setAttribute("fill", "#fff");
        whiteRect.setAttribute("fill", "#ffffff");
        blackRect.setAttribute("fill", "#000000");
    }
}