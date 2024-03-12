import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();
const COURSES_TABLE_NAME = process.env.COURSES_TABLE_NAME!;

exports.handler = async (event: any): Promise<any> => {
  const { id } = event.pathParameters;

  try {
    const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
      TableName: COURSES_TABLE_NAME,
      Key: { id },
    };

    const { Item } = await dynamodb.get(params).promise();

    if (Item) {
      return {
        statusCode: 200,
        body: JSON.stringify(Item),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'Course not found' }),
      };
    }
  } catch (err) {
    console.error('Error getting course', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error getting course' }),
    };
  }
};