import express from "express";
import path from "path";
import "dotenv/config";

const app = express();

app.use(express.json());

app.use("/static", express.static("dist/public"), express.static("src/public"));

app.get("/", async (_req, res) => {
    res.sendFile(path.resolve("src/public/pages/report/index.html"));
});

app.listen(process.env.PORT, () => {
    console.log("Server running.");
});
