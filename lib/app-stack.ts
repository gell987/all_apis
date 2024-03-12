import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { RemovalPolicy } from "aws-cdk-lib";

export class CourseApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // S3 Bucket for storing course thumbnails and other assets
    const bucket = new s3.Bucket(this, "testing", {
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // DynamoDB Table for Courses
    const courseTable = new dynamodb.Table(this, "CoursesTable", {
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    // Lambda Functions for Each Endpoint
    const functions = [
      "uploadCourse",
      "editCourse",
      "getSingleCourse",
      "getAllCourses",
      "getCourseByUser",
      "addQuestion",
      "addAnswer",
      "addReview",
      "addReplyToReview",
      "getAdminAllCourses",
      "deleteCourse",
      "generateVideoUrl",
    ];

    functions.forEach((funcName) => {
      const lambdaFunction = new lambda.Function(this, `${funcName}Function`, {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: `${funcName}`,
        code: lambda.Code.fromAsset("lambda"),
        environment: {
          COURSES_TABLE_NAME: courseTable.tableName,
          ASSETS_BUCKET_NAME: bucket.bucketName,
        },
      });

      // Grant the Lambda function read/write permissions to the Courses Table and the S3 Bucket
      courseTable.grantReadWriteData(lambdaFunction);
      bucket.grantReadWrite(lambdaFunction);
    });

    // API Gateway to expose the Lambda functions as HTTP endpoints
    const api = new apigateway.RestApi(this, "CoursesApi", {
      restApiName: "Courses Service",
      description: "This service serves courses.",
    });

    // Dynamically create API Gateway resources and methods based on the functions
    functions.forEach((funcName) => {
      const lambdaFunction = lambda.Function.fromFunctionArn(
        this,
        `${funcName}Lookup`,
        cdk.Fn.getAtt(`${funcName}Function`, "Arn").toString()
      );
      const resource = api.root.addResource(funcName);
      resource.addMethod(
        "ANY",
        new apigateway.LambdaIntegration(lambdaFunction)
      );
    });
  }
}
