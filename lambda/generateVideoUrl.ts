// Import the AWS SDK
import { DynamoDB, S3 } from 'aws-sdk';

// Create a new S3 instance

const s3 = new S3();
// Name of the S3 bucket where the videos are stored
const VIDEOS_BUCKET_NAME = process.env.VIDEOS_BUCKET_NAME;

exports.handler = async (event: any) => {
  // Extract video ID or file name from the event, e.g., from the query string parameters
  const videoId = event.queryStringParameters.videoId;

  // Define the key for the video in the S3 bucket, assuming the video ID corresponds to the file name
  const videoKey = `${videoId}.mp4`; // Adjust the file extension as necessary

  try {
    // Generate a signed URL for the video
    const url = s3.getSignedUrl('getObject', {
      Bucket: VIDEOS_BUCKET_NAME,
      Key: videoKey,
      Expires: 60 * 60, // URL expiration time in seconds (e.g., 1 hour)
    });

    // Return the signed URL
    return {
      statusCode: 200,
      body: JSON.stringify({
        url: url,
      }),
    };
  } catch (error) {
    console.error('Error generating signed URL for video:', error);

    // Return an error response
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to generate signed URL for the video',
        error: error,
      }),
    };
  }
};
