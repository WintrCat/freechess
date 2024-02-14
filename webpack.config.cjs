const path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/public/pages/report/scripts/index.ts",
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        extensionAlias: {
            ".js": [".js", ".ts"],
        },
    },
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, "dist/public"),
    },
};
