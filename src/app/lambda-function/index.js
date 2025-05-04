import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({ region: "eu-north-1" });

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.requestContext?.http?.method === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    const body = JSON.parse(event.body);

    if (!body.image) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No image data provided' })
      };
    }

    const buffer = Buffer.from(body.image, 'base64');
    const fileName = `image-${Date.now()}.jpg`;

    await s3Client.send(new PutObjectCommand({
      Bucket: "cloud-image-uploader",
      Key: fileName,
      Body: buffer,
      ContentType: 'image/jpeg'
    }));

    const signedUrl = await getSignedUrl(
      s3Client,
      new GetObjectCommand({
        Bucket: "cloud-image-uploader",
        Key: fileName
      }),
      { expiresIn: 60 }
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ imageUrl: signedUrl })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};