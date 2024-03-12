import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();
const COURSES_TABLE_NAME = process.env.COURSES_TABLE_NAME!;

interface Review {
    review: string;
    rating: number;
    user: string;
}

interface ReviewInput {
  courseId: string;
  review: string;
  rating: number;
  user: string;
}

exports.handler = async (event: any): Promise<any> => {
  const requestBody: ReviewInput = JSON.parse(event.body);
  const { courseId, review, rating, user } = requestBody;

  try {
    const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: COURSES_TABLE_NAME,
      Key: { id: courseId },
      UpdateExpression: 'SET reviews = list_append(if_not_exists(reviews, :empty_list), :review)',
      ExpressionAttributeValues: {
        ':empty_list': [],
        ':review': [{ review, rating, user }],
      },
    };

    await dynamodb.update(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Review added successfully' }),
    };
  } catch (err) {
    console.error('Error adding review', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error adding review' }),
    };
  }
};