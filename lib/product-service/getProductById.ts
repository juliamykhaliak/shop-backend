const { products: productList } = require("./shared-layer/data/mockedProducts");

exports.handler = async (event: any) => {
  const { id } = event.pathParameters || {};

  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Product ID is required" }),
    };
  }

  const product = productList.find((p: any) => p.id === id);

  if (!product) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: "Product not found" }),
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:3000",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: JSON.stringify(product),
  };
};
