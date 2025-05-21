import {Construct} from "constructs";
import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3n from "aws-cdk-lib/aws-s3-notifications";
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class ImportServiceStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'ImportBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    const importProductsFileLambda = new lambda.Function(this, 'ImportProductsFile', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, './')),
      handler: 'importProductsFile.handler',
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    })

    const importFileParserLambda = new lambda.Function(this, 'ImportFileParser', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, './')),
      handler: 'importFileParser.handler',
      environment: {
        BUCKET_NAME: bucket.bucketName,
      },
    });

    // Deploy an empty file to create the 'uploaded/' folder
    new s3deploy.BucketDeployment(this, 'DeployUploadedFolder', {
      sources: [s3deploy.Source.data('uploaded/.keep', '')],
      destinationBucket: bucket,
      destinationKeyPrefix: 'uploaded/',
    });

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(importFileParserLambda),
      { prefix: 'uploaded/' }
    );

    bucket.grantRead(importFileParserLambda);

    // Define the API Gateway
    const api = new apigateway.RestApi(this, "ImportServiceApi", {
      restApiName: "Import Products Service",
    });

    // Add /import endpoint
    const importProductsResource = api.root.addResource("import");
    importProductsResource.addMethod("GET", new apigateway.LambdaIntegration(importProductsFileLambda));
  }
}