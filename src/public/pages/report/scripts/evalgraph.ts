const evaluationGraphContainer = $("#evalgraph-container");
const evaluationGraphCtx = ($("#evaluation-graph").get(0)! as HTMLCanvasElement).getContext("2d")!;
let hoverIndex: number | null = null;
let topLines: (EngineLine | undefined)[] = [];
let isNewGame = false;
let mouseX = 0;
let mouseY = 0;
let cursorImg: HTMLImageElement | null = null;

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
        let classification = positions[i]?.classification;
        let classificationColour = classification ? classificationColours[classification] : "#4caf50";

        if (i === hoverIndex) {
            evaluationGraphCtx.fillStyle = "#555555";
        } else {
            evaluationGraphCtx.fillStyle = "#000000";
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
             if (i === hoverIndex) {
                evaluationGraphCtx.fillStyle = "#dddddd";
            } else {
                evaluationGraphCtx.fillStyle = "#ffffff";
            }

            if (!boardFlipped) {
                evaluationGraphCtx.fillRect(cumulativeWidth - currentBarWidth, graphHeight - height, currentBarWidth, height);
            } else {
                evaluationGraphCtx.fillRect(cumulativeWidth - currentBarWidth, 0, currentBarWidth, height);
            }
        }
        
        if (i === currentMoveIndex && i === hoverIndex) {
            evaluationGraphCtx.fillStyle = classification ? getSemiTransparentColor(classificationColour, 0.8) : getSemiTransparentColor("#000000", 0.2);
            evaluationGraphCtx.fillRect(cumulativeWidth - currentBarWidth, 0, currentBarWidth, graphHeight);
        } else if (i === currentMoveIndex) {
            evaluationGraphCtx.fillStyle = classification ? getSemiTransparentColor(classificationColour, 0.5) : getSemiTransparentColor("#000000", 0.2);
            evaluationGraphCtx.fillRect(cumulativeWidth - currentBarWidth, 0, currentBarWidth, graphHeight);
        } else if (i === hoverIndex) {
            evaluationGraphCtx.fillStyle = classification ? getSemiTransparentColor(classificationColour, 0.5) : getSemiTransparentColor("#000000", 0.2);
            evaluationGraphCtx.fillRect(cumulativeWidth - currentBarWidth, 0, currentBarWidth, graphHeight);
        }
    }

    // Fill any remaining pixels at the right edge
    if (cumulativeWidth < desiredGraphWidth) {
        const remainingWidth = desiredGraphWidth - cumulativeWidth;
        evaluationGraphCtx.fillStyle = "#000000";
        evaluationGraphCtx.fillRect(cumulativeWidth, 0, remainingWidth, graphHeight);
    }
    
    // Draw midline
    evaluationGraphCtx.beginPath();
    evaluationGraphCtx.moveTo(0, graphHeight / 2);
    evaluationGraphCtx.lineTo(desiredGraphWidth, graphHeight / 2);
    evaluationGraphCtx.lineWidth = 1;
    evaluationGraphCtx.strokeStyle = '#ff5555';
    evaluationGraphCtx.stroke();

    // Draw classification icon for hovered move
    cumulativeWidth = 0;
    for (let i = 0; i < topLines.length; i++) {
        let currentBarWidth = baseBarWidth + Math.floor((i + 1) * extraWidthPerBar) - Math.floor(i * extraWidthPerBar);
    
        if (i === hoverIndex) {
            const classification = positions[i]?.classification;
            if (classification && classificationIcons[classification]) {
                const icon = classificationIcons[classification];
                const iconSize = 15;
                let iconX = mouseX < iconSize ? mouseX : mouseX - iconSize - 2;
                let iconY = mouseY < iconSize / 2 ? 0 : mouseY - iconSize / 2;
                iconY = mouseY > graphHeight - iconSize / 2 ? graphHeight - iconSize : iconY;
    
                if (icon) {

                    
                    const canvasWidth = evaluationGraphCtx.canvas.width;
                    const canvasHeight = evaluationGraphCtx.canvas.height;
                    let speechBubble: any = new (window as any).SpeechBubble(evaluationGraphCtx);
                    speechBubble.text = "  "
                    if (hoverIndex % 2 === 0) {
                        speechBubble.text += blackPlayer.username;
                    }
                    else {
                        speechBubble.text += whitePlayer.username;
                    }
                    speechBubble.setTargetPos(mouseX, mouseY);
                    const bubbleWidth = Math.max(blackPlayer.username.length, whitePlayer.username.length) * 12;
                    const bubbleHeight = 10;
                    let bubbleLeft = mouseX + 5;
                    let bubbleTop = mouseY + 5;
                    let bubblePadding = 7;
                    let bubbleGapX = 3;
                    let bubbleGapY = 5;
                    let totalHeight = mouseY + bubbleHeight + bubbleGapY + bubblePadding * 2;
                    let totalWidth = mouseX + bubbleWidth + bubbleGapX + bubblePadding * 2;

                    if (totalHeight > canvasHeight && totalWidth > canvasWidth) {
                        bubbleTop = mouseY - bubbleHeight - bubblePadding * 2;
                        bubbleLeft = mouseX - bubbleWidth - bubblePadding;
                    }
                    else {
                        if (totalHeight > canvasHeight) {
                            bubbleTop -= totalHeight - canvasHeight;
                        } else {
                            bubbleTop = mouseY + bubblePadding;
                        }
                        
                        if (totalWidth > canvasWidth) {
                            bubbleLeft -= totalWidth - canvasWidth;
                        } else {
                            bubbleLeft = mouseX + bubblePadding;
                        }
                    }

                    
                    if (bubbleLeft < 0) {
                        bubbleLeft = 0;
                    } else if (bubbleLeft + bubbleWidth > canvasWidth) {
                        bubbleLeft = canvasWidth - bubbleWidth;
                    }
                    
                    if (bubbleTop < 0) {
                        bubbleTop = 0;
                    } else if (bubbleTop + bubbleHeight > canvasHeight) {
                        bubbleTop = canvasHeight - bubbleHeight;
                    }
                    
                    speechBubble.panelBounds = new (window as any).SpeechBubble.Bounds(bubbleTop, bubbleLeft, bubbleWidth, bubbleHeight);
                    
                    speechBubble.fontSize = 12;
                    speechBubble.padding = 2; 
                    speechBubble.cornerRadius = 2; 
                    speechBubble.panelBorderWidth = 1; 
                    speechBubble.panelBorderColor = "#000"; 
                    speechBubble.fontColor = "#000"; 
                    speechBubble.padding = bubblePadding; 
                    speechBubble.font = "JetBrains Mono"; 
                    speechBubble.panelFillColor = "rgba(255,255,255,0.7)"; 
                    speechBubble.tailStyle = (window as any).SpeechBubble.TAIL_STRAIGHT; 
                    
                    speechBubble.draw();

                    const imgX = bubbleLeft + bubbleGapX;
                    const imgY = bubbleTop + bubbleGapY;

                    evaluationGraphCtx.drawImage(icon, imgX, imgY, iconSize, iconSize);
                }
            }
        }
        cumulativeWidth += currentBarWidth;
    }

    // Add listeners only on new game load, for performance.
    if (isNewGame) {
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
            mouseX = event.clientX - rect.left;
            mouseY = event.clientY - rect.top;
            let cumulativeWidth = 0;
            let newHoverIndex = null;

            for (let i = 0; i < positions.length; i++) {
                let currentBarWidth = baseBarWidth + Math.floor((i + 1) * extraWidthPerBar) - Math.floor(i * extraWidthPerBar);
                if (mouseX < cumulativeWidth + currentBarWidth) {
                    newHoverIndex = i;
                    break;
                }
                cumulativeWidth += currentBarWidth;
            }

            hoverIndex = newHoverIndex;
            drawEvaluationGraph();
            drawCursor();
        });

        graphCanvas.addEventListener('mouseout', () => {
            hoverIndex = null;
            drawEvaluationGraph();
        });

        isNewGame = false;
    }
}

function drawCursor() {
    loadSprite("crosshair.png").then(image => {
        cursorImg = image
    });
    
    let cursorSize = 10;
    
    if (cursorImg) {
        evaluationGraphCtx.drawImage(cursorImg, mouseX - cursorSize / 2, mouseY - cursorSize / 2, cursorSize, cursorSize);
    }
    

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

function getSemiTransparentColor(color: string, opacity: number): string {
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}