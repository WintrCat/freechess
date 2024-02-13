const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/public/pages/report/scripts/index.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "babel-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist/public"),
    },
};
