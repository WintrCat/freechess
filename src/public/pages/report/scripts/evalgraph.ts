const evaluationGraphContainer = $("#evalgraph-container")
const evaluationGraphCtx = ($("#evaluation-graph").get(0)! as HTMLCanvasElement).getContext("2d")!;
let hoverIndex: number | null = null;
let isListenersAdded: boolean = false;
let topLines: (EngineLine | undefined)[] = [{ id: 1, depth: 1, evaluation: { type: "cp", value: 0 }, moveUCI: "e2e4" }];

async function drawEvaluationGraph() {
    const graphHeight = 80;
    const desiredGraphWidth = 350;
    const maxEval = 1100; // max centipawn value seems to be 1100, or max centipawn loss of -1100
    const cpPerPixel = maxEval / (graphHeight / 2)
    let positions = reportResults?.positions!;
    const barWidth = Math.floor(desiredGraphWidth / positions.length);
    const graphWidth = barWidth * positions.length
    const leftEdge = Math.floor((desiredGraphWidth - graphWidth) / 2);
    const graphCanvas = document.getElementById('evaluation-graph') as HTMLCanvasElement;
    graphCanvas.width = desiredGraphWidth;
    graphCanvas.height = graphHeight;
    evaluationGraphCtx.clearRect(0, 0, graphWidth, graphHeight);

    let prevColor = "#ffffff";
    topLines = positions.map(position => position?.topLines?.find(line => line.id == 1));

    for (let i = 0; i < topLines.length; i++)
    {
        let topLine = topLines[i];
        let evaluation = topLine?.evaluation;
                
        if (i === currentMoveIndex) {
             evaluationGraphCtx.fillStyle = "#4caf50";
        }
        else if (i === hoverIndex) {
            evaluationGraphCtx.fillStyle = "#555555";
        } else {
            evaluationGraphCtx.fillStyle = "#000000";
        }
        evaluationGraphCtx.fillRect(leftEdge + i * barWidth, 0, barWidth, graphHeight);
        
        if (evaluation?.type === "mate" ) {
            let moveColour = getMovedPlayerByPosition(positions[i].fen);

            if (evaluation.value === 0)
            {
                evaluationGraphCtx.fillStyle = moveColour === "white" ? "#ffffff" : "#000000";
            }
            else {
                if (i === currentMoveIndex) {
                    evaluationGraphCtx.fillStyle = i === hoverIndex ? "#4cef50" : "#8cef90";
                }
                else if (i === hoverIndex) {
                    evaluationGraphCtx.fillStyle = evaluation.value >= 0 ? "#bbbbbb" : "#555555";
                }
                else {
                    evaluationGraphCtx.fillStyle = evaluation.value >= 0 ? "#ffffff" : "#000000";
                }
            }
            evaluationGraphCtx.fillRect(leftEdge + i * barWidth, 0, barWidth, graphHeight);
        }
        else if (evaluation?.type == "cp") {
            let height = graphHeight / 2 + evaluation?.value / cpPerPixel;
            
            if (i === currentMoveIndex) {
                evaluationGraphCtx.fillStyle = i === hoverIndex ? "#4cef50" : "#8cef90";
            }
            else {
                evaluationGraphCtx.fillStyle = i === hoverIndex ? "#bbbbbb" : "#ffffff";
            }

            if (!boardFlipped) {
                evaluationGraphCtx.fillRect(leftEdge + i * barWidth, graphHeight - height, barWidth, height);
            } else {
                evaluationGraphCtx.fillRect(leftEdge + i * barWidth, 0, barWidth, height);
            }
        } 
    }
    
    if (!isListenersAdded) {
        graphCanvas.addEventListener('click', (event: MouseEvent) => {
            const rect = graphCanvas.getBoundingClientRect();
            const x = event.clientX - rect.left - leftEdge;
            const clickedMoveIndex = Math.floor(x / barWidth);

            traverseMoves(clickedMoveIndex - currentMoveIndex);
        });
                
        graphCanvas.addEventListener('mousemove', (event: MouseEvent) => {
            const rect = graphCanvas.getBoundingClientRect();
            const x = event.clientX - rect.left - leftEdge;
            const newHoverIndex = Math.floor(x / barWidth);
            
            if (newHoverIndex !== hoverIndex) {
                hoverIndex = newHoverIndex;
                drawEvaluationGraph();
            }
        });
        
        graphCanvas.addEventListener('mouseout', () => {
            hoverIndex = null;
            drawEvaluationGraph();
        });

        isListenersAdded = true;
    }

    evaluationGraphCtx.beginPath();
    evaluationGraphCtx.moveTo(leftEdge, graphHeight / 2);
    evaluationGraphCtx.lineTo(leftEdge + graphWidth, graphHeight / 2);
    evaluationGraphCtx.lineWidth = 1;
    evaluationGraphCtx.strokeStyle = '#ff5555';
    evaluationGraphCtx.stroke();
}



function getMovedPlayerByPosition(fen: string) {
    return fen.includes(" b ") ? "white" : "black";
 }

function getMovedPieceByPosition(san: string): string | null {
    let prospectivePiece = san.charAt(0)
    let pieceColour = getMovedPlayerByPosition(san);

    if (prospectivePiece >= 'a' && prospectivePiece <= 'h') {
        const matches = san.match(/[a-h]\d.*[a-h]\d/)
        if (matches) {
            return null
        }
        return pieceColour === 'white' ? 'P' : 'p'
    }
    prospectivePiece = prospectivePiece.toLowerCase()
    if (prospectivePiece === 'o') {
        return pieceColour === 'white' ? 'K' : 'k'
    }

    return pieceColour === 'white' ? prospectivePiece.toUpperCase() : prospectivePiece.toLowerCase()
}