const b2 = require('./backblaze');
require('dotenv').config({ path: '../.env' });
const testBackblazeConnection = async () => {
  try {
    // Authorize with Backblaze B2
    await b2.authorize();
    console.log('Authorization successful');

    // List files in the specified bucket to verify connection
    const response = await b2.listFileNames({
      bucketId: process.env.B2_BUCKET_ID,
      maxFileCount: 1, // Limit the number of files listed for testing
    });
    console.log('Files in bucket:', response.data.files);
  } catch (error) {
    console.error('Error connecting to Backblaze B2:', error);
  }
};

testBackblazeConnection();