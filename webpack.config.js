const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require('webpack');
require('dotenv').config();

module.exports = {
    entry: "./src/index.js", // Dẫn tới file index.js ta đã tạo
    output: {
        path: path.join(__dirname, "/build"),
        filename: "bundle.js",
        publicPath: "/"
    },
    devServer: {
        hot: true,
        historyApiFallback: true,
        client: {
            webSocketURL: 'ws://localhost:8080/ws',
        }
    },
    module: {
        rules: [
        {
            test: /\.js$/, // Sẽ sử dụng babel-loader cho những file .js
            exclude: /node_modules/, // Loại trừ thư mục node_modules
            use: ["babel-loader"]
        },
        {
            test: /\.css$/, // Sử dụng style-loader, css-loader cho file .css
            use: ["style-loader", "css-loader"]
        },
        {
            test: /\.(png|jpe?g|gif|svg)$/i,
            type: 'asset/resource',
        },
        ]
    },
    
    // Chứa các plugins sẽ cài đặt trong tương lai
    plugins: [
        new HtmlWebpackPlugin({
            template: "./public/index.html"
        }),
        new webpack.DefinePlugin({
            'process.env.REACT_APP_API_URL': JSON.stringify(process.env.REACT_APP_API_URL)
        })
    ]
};
