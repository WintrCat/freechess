const evaluationBarCtx = ($("#evaluation-bar").get(0)! as HTMLCanvasElement).getContext("2d")!;

async function drawEvaluationBar(evaluation: Evaluation) {
    evaluationBarCtx.clearRect(0, 0, 30, 720);
    evaluationBarCtx.font = "16px Arial";
    evaluationBarCtx.fillStyle = "#1e1e1e";

    if (evaluation.type == "cp") {
        let height = Math.max(Math.min(360 - evaluation.value / 3, 680), 40);
        evaluationBarCtx.fillRect(0, 0, 30, height);
        
        let evaluationText = Math.abs(evaluation.value / 100).toFixed(1);
        let evaluationTextWidth = evaluationBarCtx.measureText(evaluationText).width;

        let evaluationTextY = evaluation.value >= 0 ? 710 : 20;
        evaluationBarCtx.fillStyle = evaluation.value >= 0 ? "#1e1e1e" : "#ffffff"; 
        evaluationBarCtx.fillText(evaluationText, 15 - evaluationTextWidth / 2, evaluationTextY, 30);
    } else {
        let evaluationText = "M" + Math.abs(evaluation.value).toString();
        let evaluationTextWidth = evaluationBarCtx.measureText(evaluationText).width;

        if (evaluation.value > 0) {
            evaluationBarCtx.fillStyle = "#1e1e1e";
            evaluationBarCtx.fillText(evaluationText, 15 - evaluationTextWidth / 2, 710, 30);
        } else if (evaluation.value < 0) {
            evaluationBarCtx.fillRect(0, 0, 30, 720);            

            evaluationBarCtx.fillStyle = "#ffffff";
            evaluationBarCtx.fillText(evaluationText, 15 - evaluationTextWidth / 2, 20, 30);
        } else if (evaluation.value == 0) {
            evaluationBarCtx.fillStyle = "#676767";
            evaluationBarCtx.fillRect(0, 0, 30, 720);
        }
    }
}