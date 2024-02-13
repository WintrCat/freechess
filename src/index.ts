import express from "express";
import path from "path";
import "dotenv/config";

import apiRouter from "./api.js";

const app = express();

app.use(express.json());

app.use("/static", express.static("dist/public"), express.static("src/public"));

app.use("/api", apiRouter);

app.get("/", async (req, res) => {
    res.sendFile(path.resolve("src/public/pages/report/index.html"));
});

app.listen(process.env.PORT, () => {
    console.log("Server running.");
});
