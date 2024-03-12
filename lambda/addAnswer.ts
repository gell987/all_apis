import { DynamoDB } from 'aws-sdk';

const dynamodb = new DynamoDB.DocumentClient();
const COURSES_TABLE_NAME = process.env.COURSES_TABLE_NAME!;

interface Answer {
    answer: string;
    user: string;
}

interface AnswerInput {
  courseId: string;
  questionIndex: number;
  answer: string;
  user: string;
}

exports.handler = async (event: any): Promise<any> => {
  const requestBody: AnswerInput = JSON.parse(event.body);
  const { courseId, questionIndex, answer, user } = requestBody;

  try {
    const params: AWS.DynamoDB.DocumentClient.UpdateItemInput = {
      TableName: COURSES_TABLE_NAME,
      Key: { id: courseId },
      UpdateExpression: 'SET questions[?].answers = list_append(if_not_exists(questions[?].answers, :empty_list), :answer)',
      ExpressionAttributeValues: {
        ':empty_list': [],
        ':answer': [{ answer, user }],
        ':index': questionIndex,
      },
      ConditionExpression: 'size(questions) > :index',
    };

    await dynamodb.update(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Answer added successfully' }),
    };
  } catch (err) {
    console.error('Error adding answer', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error adding answer' }),
    };
  }
};