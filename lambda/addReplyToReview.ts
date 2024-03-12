import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();
const COURSES_TABLE_NAME = process.env.COURSES_TABLE_NAME!;

interface Reply {
    reply: string;
    user: string;
}

interface ReplyInput {
  courseId: string;
  reviewIndex: number;
  reply: string;
  user: string;
}

exports.handler = async (event: any): Promise<any> => {
  const requestBody: ReplyInput = JSON.parse(event.body);
  const { courseId, reviewIndex, reply, user } = requestBody;

  try {
    const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: COURSES_TABLE_NAME,
      Key: { id: courseId },
      UpdateExpression: 'SET reviews[?].replies = list_append(if_not_exists(reviews[?].replies, :empty_list), :reply)',
      ExpressionAttributeValues: {
        ':empty_list': [],
        ':reply': [{ reply, user }],
        ':index': reviewIndex,
      },
      ConditionExpression: 'size(reviews) > :index',
    };

    await dynamodb.update(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Reply added successfully' }),
    };
  } catch (err) {
    console.error('Error adding reply to review', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error adding reply to review' }),
    };
  }
};