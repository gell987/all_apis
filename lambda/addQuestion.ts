import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();
const COURSES_TABLE_NAME = process.env.COURSES_TABLE_NAME!;

interface Question {
    question: string;
    user: string;
}

interface QuestionInput {
    courseId: string;
    question: string;
    user: string;
}

exports.handler = async (event: any): Promise<any> => {
  const requestBody: QuestionInput = JSON.parse(event.body);
  const { courseId, question, user } = requestBody;

  try {
    const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: COURSES_TABLE_NAME,
      Key: { id: courseId },
      UpdateExpression: 'SET questions = list_append(if_not_exists(questions, :empty_list), :question)',
      ExpressionAttributeValues: {
        ':empty_list': [],
        ':question': [{ question, user }],
      },
    };

    await dynamodb.update(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Question added successfully' }),
    };
  } catch (err) {
    console.error('Error adding question', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error adding question' }),
    };
  }
};