import { writeFileSync, mkdirSync, existsSync } from "fs";
import analyse from "../public/pages/report/scripts/classificationLogic/analysis.js";
import { EvaluatedPosition } from "../public/pages/report/scripts/classificationLogic/types/Position.js";
import { Report } from "../public/pages/report/scripts/types.js";
import evaluations from "./evaluations.json" assert { type: "json" };

const reports: Report[] = [];

async function main() {
    let before = Date.now();

    if (!existsSync("src/test/reports")) {
        mkdirSync("src/test/reports");
    }

    let gameIndex = 0;
    for (let game of evaluations) {
        gameIndex++;
        try {
            let report = await analyse(game as EvaluatedPosition[]);

            reports.push(report);
            writeFileSync(
                `src/test/reports/report${gameIndex}.json`,
                JSON.stringify({
                    players: {
                        white: {
                            username: "White Player",
                            rating: "0",
                        },
                        black: {
                            username: "Black Player",
                            rating: "0",
                        },
                    },
                    results: report,
                })
            );

            console.log(`Generated report from game ${gameIndex}...`);
        } catch (err) {
            console.log(
                `Evaluated positions from game ${gameIndex} threw an error.`
            );
            console.log(err);
        }
    }

    let elapsedTime = ((Date.now() - before) / 1000).toFixed(2);
    console.log(
        `Report generation test completed successfully. (${elapsedTime}s)`
    );
}

main();
