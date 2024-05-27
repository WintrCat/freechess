const evaluationGraphContainer = $("#evalgraph-container");
const evaluationGraphCtx = ($("#evaluation-graph").get(0)! as HTMLCanvasElement).getContext("2d")!;
let hoverIndex: number | null = null;
let isListenersAdded: boolean = false;
let topLines: (EngineLine | undefined)[] = [];

async function drawEvaluationGraph() {
    const graphHeight = 80;
    const desiredGraphWidth = 350;
    const maxEval = 1100; // Max centipawn value seems to be 1100, or max centipawn loss of -1100
    const cpPerPixel = maxEval / (graphHeight / 2);
    let positions = reportResults?.positions!;
    let baseBarWidth = Math.floor(desiredGraphWidth / positions.length);
    let remainderPixels = desiredGraphWidth - (baseBarWidth * positions.length);
    let extraWidthPerBar = remainderPixels / positions.length;
    let graphCanvas = document.getElementById('evaluation-graph') as HTMLCanvasElement;
    graphCanvas.width = desiredGraphWidth;
    graphCanvas.height = graphHeight;

    topLines = positions.map(position => position?.topLines?.find(line => line.id == 1));

    let cumulativeWidth = 0;

    for (let i = 0; i < topLines.length; i++) {
        let topLine = topLines[i];
        let evaluation = topLine?.evaluation;
        let currentBarWidth = baseBarWidth + Math.floor((i + 1) * extraWidthPerBar) - Math.floor(i * extraWidthPerBar);

        if (i === currentMoveIndex && i === hoverIndex) {
            evaluationGraphCtx.fillStyle = "#4cef50"; // Brighter green when current move is hovered
        } else if (i === currentMoveIndex) {
            evaluationGraphCtx.fillStyle = "#4caf50"; // Green for current move
        } else if (i === hoverIndex) {
            evaluationGraphCtx.fillStyle = "#555555"; // Grey for hovered bar
        } else {
            evaluationGraphCtx.fillStyle = "#000000"; // Default black for other bars
        }
        evaluationGraphCtx.fillRect(cumulativeWidth, 0, currentBarWidth, graphHeight);
        cumulativeWidth += currentBarWidth;

        if (evaluation?.type === "mate") {
            let moveColour = getMovedPlayerByPosition(positions[i].fen);

            if (evaluation.value === 0) {
                evaluationGraphCtx.fillStyle = moveColour === "white" ? "#ffffff" : "#000000";
            } else {
                if (i === currentMoveIndex && i === hoverIndex) {
                    evaluationGraphCtx.fillStyle = "#4cef50";
                } else if (i === currentMoveIndex) {
                    evaluationGraphCtx.fillStyle = "#8cef90";
                } else if (i === hoverIndex) {
                    evaluationGraphCtx.fillStyle = evaluation.value >= 0 ? "#bbbbbb" : "#555555";
                } else {
                    evaluationGraphCtx.fillStyle = evaluation.value >= 0 ? "#ffffff" : "#000000";
                }
            }
            evaluationGraphCtx.fillRect(cumulativeWidth - currentBarWidth, 0, currentBarWidth, graphHeight);
        } else if (evaluation?.type == "cp") {
            let height = graphHeight / 2 + evaluation?.value / cpPerPixel;

            if (i === currentMoveIndex && i === hoverIndex) {
                evaluationGraphCtx.fillStyle = "#4cef50";
            } else if (i === currentMoveIndex) {
                evaluationGraphCtx.fillStyle = "#8cef90";
            } else if (i === hoverIndex) {
                evaluationGraphCtx.fillStyle = "#bbbbbb";
            } else {
                evaluationGraphCtx.fillStyle = "#ffffff";
            }

            if (!boardFlipped) {
                evaluationGraphCtx.fillRect(cumulativeWidth - currentBarWidth, graphHeight - height, currentBarWidth, height);
            } else {
                evaluationGraphCtx.fillRect(cumulativeWidth - currentBarWidth, 0, currentBarWidth, height);
            }
        }
    }

    // Fill any remaining pixels at the right edge
    if (cumulativeWidth < desiredGraphWidth) {
        const remainingWidth = desiredGraphWidth - cumulativeWidth;
        evaluationGraphCtx.fillStyle = "#000000";
        evaluationGraphCtx.fillRect(cumulativeWidth, 0, remainingWidth, graphHeight);
    }

    // Add listeners only on a new game analysis
    if (newGame) {
        graphCanvas.addEventListener('click', (event: MouseEvent) => {
            const rect = graphCanvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            let cumulativeWidth = 0;
            let clickedMoveIndex = 0;

            for (let i = 0; i < positions.length; i++) {
                let currentBarWidth = baseBarWidth + Math.floor((i + 1) * extraWidthPerBar) - Math.floor(i * extraWidthPerBar);
                if (x < cumulativeWidth + currentBarWidth) {
                    clickedMoveIndex = i;
                    break;
                }
                cumulativeWidth += currentBarWidth;
            }

            traverseMoves(clickedMoveIndex - currentMoveIndex);
        });

        graphCanvas.addEventListener('mousemove', (event: MouseEvent) => {
            const rect = graphCanvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            let cumulativeWidth = 0;
            let newHoverIndex = null;

            for (let i = 0; i < positions.length; i++) {
                let currentBarWidth = baseBarWidth + Math.floor((i + 1) * extraWidthPerBar) - Math.floor(i * extraWidthPerBar);
                if (x < cumulativeWidth + currentBarWidth) {
                    newHoverIndex = i;
                    break;
                }
                cumulativeWidth += currentBarWidth;
            }

            if (newHoverIndex !== hoverIndex) {
                hoverIndex = newHoverIndex;
                drawEvaluationGraph();
            }
        });

        graphCanvas.addEventListener('mouseout', () => {
            hoverIndex = null;
            drawEvaluationGraph();
        });

        newGame = false;
    }

    evaluationGraphCtx.beginPath();
    evaluationGraphCtx.moveTo(0, graphHeight / 2);
    evaluationGraphCtx.lineTo(desiredGraphWidth, graphHeight / 2);
    evaluationGraphCtx.lineWidth = 1;
    evaluationGraphCtx.strokeStyle = '#ff5555';
    evaluationGraphCtx.stroke();
}

function getMovedPlayerByPosition(fen: string) {
    return fen.includes(" b ") ? "white" : "black";
}

function getMovedPieceByPosition(san: string): string | null {
    let prospectivePiece = san.charAt(0);
    let pieceColour = getMovedPlayerByPosition(san);

    if (prospectivePiece >= 'a' && prospectivePiece <= 'h') {
        const matches = san.match(/[a-h]\d.*[a-h]\d/);
        if (matches) {
            return null;
        }
        return pieceColour === 'white' ? 'P' : 'p';
    }
    prospectivePiece = prospectivePiece.toLowerCase();
    if (prospectivePiece === 'o') {
        return pieceColour === 'white' ? 'K' : 'k';
    }

    return pieceColour === 'white' ? prospectivePiece.toUpperCase() : prospectivePiece.toLowerCase();
}
