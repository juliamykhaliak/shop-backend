import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from "path";

export class ProductServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
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