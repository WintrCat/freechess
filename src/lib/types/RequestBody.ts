import Position from "./Position";

export interface ParseRequestBody {
    pgn?: string;
}

export interface ReportRequestBody {
    positions?: Position[],
    captchaToken?: string
}