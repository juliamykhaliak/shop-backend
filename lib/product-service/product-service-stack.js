"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductServiceStack = void 0;
const cdk = __importStar(require("aws-cdk-lib"));
const lambda = __importStar(require("aws-cdk-lib/aws-lambda"));
const apigateway = __importStar(require("aws-cdk-lib/aws-apigateway"));
const path = __importStar(require("path"));
class ProductServiceStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // Create the Layer for mocked data
        const sharedLayer = new lambda.LayerVersion(this, "SharedLayer", {
            code: lambda.Code.fromAsset(path.join(__dirname, "shared-layer")),
            compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
            description: "A layer for mocked product data",
        });
        const getProductsListLambda = new lambda.Function(this, "GetProductsListLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset(path.join(__dirname, './')),
            handler: "getProductsList.handler",
            layers: [sharedLayer],
        });
        const getProductByIdLambda = new lambda.Function(this, "GetProductByIdLambda", {
            runtime: lambda.Runtime.NODEJS_18_X,
            code: lambda.Code.fromAsset(path.join(__dirname, './')),
            handler: "getProductById.handler",
            layers: [sharedLayer],
        });
        // Define the API Gateway
        const api = new apigateway.RestApi(this, "ProductServiceApi", {
            restApiName: "Product Service",
        });
        // Add /products endpoint
        const productsResource = api.root.addResource("products");
        productsResource.addMethod("GET", new apigateway.LambdaIntegration(getProductsListLambda));
        // Add /products/{id} endpoint
        const productByIdResource = productsResource.addResource("{id}");
        productByIdResource.addMethod("GET", new apigateway.LambdaIntegration(getProductByIdLambda));
    }
}
exports.ProductServiceStack = ProductServiceStack;
