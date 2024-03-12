// import { DynamoDB, S3 } from 'aws-sdk';

// const dynamodb = new DynamoDB.DocumentClient();
// const s3 = new S3();

// const COURSES_TABLE_NAME = process.env.COURSES_TABLE_NAME!;
// const ASSETS_BUCKET_NAME = process.env.ASSETS_BUCKET_NAME!;

// interface CourseInput {
//   id: string;
//   name?: string;
//   description?: string;
//   price?: number;
//   instructor?: string;
//   thumbnail?: string;
// }

// exports.handler = async (event: any): Promise<any> => {
//   const requestBody: CourseInput = JSON.parse(event.body);
//   const { id, name, description, price, instructor, thumbnail } = requestBody;

//   try {
//     // Update the course in DynamoDB
//     const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
//       TableName: COURSES_TABLE_NAME,
//       Key: { id },
//       UpdateExpression: 'set #n = :name, #d = :description, #p = :price, #i = :instructor',
//       ExpressionAttributeNames: {
//         '#n': 'name',
//         '#d': 'description',
//         '#p': 'price',
//         '#i': 'instructor',
//       },
//       ExpressionAttributeValues: {
//         ':name': name ?? null,
//         ':description': description ?? null,
//         ':price': price ?? null,
//         ':instructor': instructor ?? null,
//       },
//     };

//     await dynamodb.update(params).promise();

//     // Update the thumbnail in S3 if provided
//     if (thumbnail) {
//       const base64Data = Buffer.from(thumbnail.replace(/^data:image\/\w+;base64,/, ''), 'base64');
//       const s3Params: AWS.S3.PutObjectRequest = {
//         Bucket: ASSETS_BUCKET_NAME,
//         Key: `thumbnails/${id}.jpg`,
//         Body: base64Data,
//         ContentEncoding: 'base64',
//         ContentType: 'image/jpeg',
//       };
//       await s3.putObject(s3Params).promise();
//     }

//     return {
//       statusCode: 200,
//       body: JSON.stringify({ message: 'Course updated successfully' }),
//     };
//   } catch (err) {
//     console.error('Error updating course', err);
//     return {
//       statusCode: 500,
//       body: JSON.stringify({ message: 'Error updating course' }),
//     };
//   }
// };

import { APIGatewayProxyEvent } from 'aws-lambda';
import { DynamoDB, S3 } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();
const s3 = new S3();

const COURSES_TABLE_NAME = process.env.COURSES_TABLE_NAME!;
const ASSETS_BUCKET_NAME = process.env.ASSETS_BUCKET_NAME!;

interface CourseInput {
  id: string;
  name?: string;
  description?: string;
  price?: number;
  instructor?: string;
  thumbnail?: string; // Assume this is a base64-encoded image string
}

exports.handler = async (event: APIGatewayProxyEvent): Promise<any> => {
  if (!event.body) {
    return { statusCode: 400, body: JSON.stringify({ message: 'Invalid request body' }) };
  }

  const requestBody: CourseInput = JSON.parse(event.body);
  const { id, name, description, price, instructor, thumbnail } = requestBody;

  // Basic validation
  if (!id) {
    return { statusCode: 400, body: JSON.stringify({ message: 'Course ID is required' }) };
  }

  try {
    // Update the course in DynamoDB
    const updateExp = 'SET #n = :name, #d = :description, #p = :price, #i = :instructor';
    const params: DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: COURSES_TABLE_NAME,
      Key: { id },
      UpdateExpression: updateExp,
      ExpressionAttributeNames: {
        '#n': 'name',
        '#d': 'description',
        '#p': 'price',
        '#i': 'instructor',
      },
      ExpressionAttributeValues: {
        ':name': name,
        ':description': description,
        ':price': price,
        ':instructor': instructor,
      },
      ReturnValues: 'ALL_NEW', // Consider if you need the updated attributes to be returned
    };

    const updateResult = await dynamodb.update(params).promise();
    console.log('Update result:', updateResult);

    // If a thumbnail is provided, update it in S3
    if (thumbnail) {
      const base64Data = Buffer.from(thumbnail.replace(/^data:image\/\w+;base64,/, ''), 'base64');
      const s3Params: S3.PutObjectRequest = {
        Bucket: ASSETS_BUCKET_NAME,
        Key: `thumbnails/${id}.jpg`,
        Body: base64Data,
        ContentEncoding: 'base64',
        ContentType: 'image/jpeg',
      };
      await s3.putObject(s3Params).promise();
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Course updated successfully' }),
    };
  } catch (err) {
    console.error('Error updating course:', err);
    return {
      statusCode: err || 500,
      body: JSON.stringify({ message: 'Error updating course', details: err }),
    };
  }
};
