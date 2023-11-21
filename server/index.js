const express = require("express");
const path = require("path");

const app = express();

app.use(express.json());

app.use("/static", express.static("client"));
app.use("/api", require("./api"));

app.get("/", async (req, res) => {

    res.sendFile(path.resolve("client/pages/review/index.html"));

});

app.listen(8080, () => {
    console.log("Server running.");
});