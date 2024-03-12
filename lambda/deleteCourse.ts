// import { DynamoDB, S3 } from 'aws-sdk';

// const dynamodb = new DynamoDB.DocumentClient();
// const s3 = new S3();
// const COURSES_TABLE_NAME = process.env.COURSES_TABLE_NAME!;
// const ASSETS_BUCKET_NAME = process.env.ASSETS_BUCKET_NAME!;

// exports.handler = async (event: any): Promise<any> => {
//   const { id } = event.pathParameters;

//   try {
//     // Delete the course from DynamoDB
//     const params: AWS.DynamoDB.DocumentClient.DeleteItemInput = {
//       TableName: COURSES_TABLE_NAME,
//       Key: { id },
//     };

//     await dynamodb.delete(params).promise();

//     // Delete the thumbnail from S3
//     const thumbnailKey = `thumbnails/${id}.jpg`;
//     const s3Params: AWS.S3.DeleteObjectRequest = {
//       Bucket: ASSETS_BUCKET_NAME,
//       Key: thumbnailKey,
//     };

//     await s3.deleteObject(s3Params).promise();

//     // Successfully deleted the course and thumbnail
//     return {
//       statusCode: 200,
//       body: JSON.stringify({
//         message: 'Successfully deleted the course and its thumbnail',
//       }),
//     };
//   } catch (error) {
//     console.error('Error deleting the course and/or its thumbnail:', error);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({
//         message: 'Failed to delete the course and/or its thumbnail',
//         error: error,
//       }),
//     };
//   }
// };

import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDB, S3 } from "aws-sdk";

// Initialize AWS SDK clients outside the handler for better performance
const dynamodb = new DynamoDB.DocumentClient();
const s3 = new S3();

// Environment variables should be validated at the start of your Lambda
const COURSES_TABLE_NAME = process.env.COURSES_TABLE_NAME;
const ASSETS_BUCKET_NAME = process.env.ASSETS_BUCKET_NAME;

if (!COURSES_TABLE_NAME || !ASSETS_BUCKET_NAME) {
  throw new Error(
    "Environment variables for table name and bucket name are not set"
  );
}

export const handler: APIGatewayProxyHandler = async (event: any) => {
  const { id } = event.pathParameters || {};

  if (!id) {
    console.log("Missing course ID in the request pathParameters");
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Course ID is required" }),
    };
  }

  try {
    // Attempt to delete the course from DynamoDB
    await dynamodb
      .delete({
        TableName: COURSES_TABLE_NAME,
        Key: { id },
      })
      .promise();

    // Attempt to delete the course thumbnail from S3
    await s3
      .deleteObject({
        Bucket: ASSETS_BUCKET_NAME,
        Key: `thumbnails/${id}.jpg`,
      })
      .promise();

    console.log(
      `Successfully deleted course and its thumbnail for course ID: ${id}`
    );
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Successfully deleted the course and its thumbnail",
      }),
    };
  } catch (error) {
    console.error(
      `Error occurred while deleting course or thumbnail for course ID: ${id}`,
      error
    );

    // Determine error type for more specific error handling/response
    let errorMessage = "Failed to delete the course and/or its thumbnail";
    if (error === "ConditionalCheckFailedException") {
      errorMessage = "Course does not exist";
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: errorMessage,
        details: error,
      }),
    };
  }
};
