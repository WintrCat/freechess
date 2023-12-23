import { EvaluatedPosition } from "./Position";

export interface ParseRequestBody {
    pgn?: string;
}

export interface ReportRequestBody {
    positions?: EvaluatedPosition[],
    captchaToken?: string
}