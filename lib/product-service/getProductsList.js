"use strict";
const { products } = require("./shared-layer/data/mockedProducts");
exports.handler = async () => {
    return {
        statusCode: 200,
        body: JSON.stringify(products),
    };
};
