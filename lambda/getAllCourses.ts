import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();
const COURSES_TABLE_NAME = process.env.COURSES_TABLE_NAME!;

exports.handler = async (): Promise<any> => {
  try {
    const params: AWS.DynamoDB.DocumentClient.ScanInput = {
      TableName: COURSES_TABLE_NAME,
    };

    const { Items } = await dynamodb.scan(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify(Items),
    };
  } catch (err) {
    console.error('Error getting courses', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error getting courses' }),
    };
  }
};