import { DynamoDB, S3 } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const dynamodb = new DynamoDB.DocumentClient();
const s3 = new S3();

const COURSES_TABLE_NAME = process.env.COURSES_TABLE_NAME!;
const ASSETS_BUCKET_NAME = process.env.ASSETS_BUCKET_NAME!;

interface Course {
  id: string;
  name: string;
  description: string;
  price: number;
  instructor: string;
  questions: { question: string; user: string; answers?: { answer: string; user: string }[] }[];
  reviews: { review: string; rating: number; user: string; replies?: { reply: string; user: string }[] }[];
}

interface CourseInput {
  name: string;
  description: string;
  price: number;
  instructor: string;
  thumbnail: string;
}

exports.uploadCourse = async (event: any): Promise<any> => {
  const requestBody: CourseInput = JSON.parse(event.body);
  const { name, description, price, instructor, thumbnail } = requestBody;

  try {
    const courseId = uuidv4();

    // Store course data in DynamoDB
    const params: AWS.DynamoDB.DocumentClient.PutItemInput = {
      TableName: COURSES_TABLE_NAME,
      Item: {
        id: courseId,
        name,
        description,
        price,
        instructor,
        questions: [],
        reviews: [],
      },
    };

    await dynamodb.put(params).promise();

    // Store thumbnail in S3
    const base64Data = Buffer.from(thumbnail.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const s3Params: AWS.S3.PutObjectRequest = {
      Bucket: ASSETS_BUCKET_NAME,
      Key: `thumbnails/${courseId}.jpg`,
      Body: base64Data,
      ContentEncoding: 'base64',
      ContentType: 'image/jpeg',
    };
    await s3.putObject(s3Params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ courseId }),
    };
  } catch (err) {
    console.error('Error uploading course', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error uploading course' }),
    };
  }
};