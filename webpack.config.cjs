const path = require("path");

module.exports = {
    mode: "development",
    entry: "./project/frontend/src/lib/index.ts",
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
        path: path.resolve(__dirname, "dist/frontend/public"),
    },
};
