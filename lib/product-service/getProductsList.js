"use strict";
const { products } = require("./shared-layer/data/mockedProducts");
exports.handler = async () => {
    return {
        statusCode: 200,
        body: JSON.stringify(products),
        headers: {
            "Access-Control-Allow-Origin": "http://localhost:3000",
            "Access-Control-Allow-Methods": "GET",
            "Access-Control-Allow-Headers": "Content-Type",
        },
    };
};
