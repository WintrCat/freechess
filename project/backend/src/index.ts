import express from "express";
import path from "path";
import "dotenv/config";

const app = express();

app.use(express.json());

app.use(
    "/static",
    express.static("dist/frontend/public"),
    express.static("project/frontend/public")
);

app.get("/", async (_req, res) => {
    res.sendFile(path.resolve("project/frontend/public/index.html"));
});

app.listen(process.env.PORT, () => {
    console.log("Server running.");
});
