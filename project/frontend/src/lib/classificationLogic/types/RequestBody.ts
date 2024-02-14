import { EvaluatedPosition } from "./Position.js";

export interface ParseRequestBody {
    pgn?: string;
}

export interface ReportRequestBody {
    positions?: EvaluatedPosition[];
    captchaToken?: string;
}
