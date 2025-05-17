// src/services/s3Store.js
const AWS = require('aws-sdk');

const s3 = new AWS.S3({
  region: process.env.AWS_REGION,
  accessKeyId:  process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

async function saveFile(buffer, key, contentType) {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ACL: 'public-read',
  };
  const { Location } = await s3.upload(params).promise();
  return Location;
}

/**
 * Save JSON content to the S3 location specified in metadata.fileUrl.
 * @param {Object} data - The JSON object containing metadata and content.
 */
async function saveJsonAsfile(data) {
  if (!data.metadata || !data.metadata.fileUrl) {
    throw new Error('Invalid data: metadata or fileUrl is missing');
  }

  const key = data.metadata.fileUrl.split('/').pop(); // Extract the key from the fileUrl

  // Combine metadata and content into a single object
  const fileData = {
    metadata: data.metadata,
    content: data.content,
  };

  const params = {
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: JSON.stringify(fileData, null, 2), // Convert JSON to string
    ContentType: 'application/json',
    ACL: 'public-read',
  };

  const { Location } = await s3.upload(params).promise();
  return Location; // Return the S3 URL of the saved file
}

async function getFile(fileUrl) {
  const key = fileUrl.split('/').pop();
  const s3 = new AWS.S3();
  const data = await s3.getObject({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
  }).promise();
  return JSON.parse(data.Body.toString('utf-8'));
}

module.exports = { saveFile, getFile, saveJsonAsfile };
