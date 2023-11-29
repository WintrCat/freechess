const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(express.json());

app.use("/static", express.static("client"));
app.use("/api", require("./api"));

app.get("/", async (req, res) => {

    res.sendFile(path.resolve("client/pages/report/index.html"));

});

app.listen(8080, () => {
    console.log("Server running.");
});