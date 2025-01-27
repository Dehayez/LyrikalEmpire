const multer = require('multer');
const B2 = require('backblaze-b2');

const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
});

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const uploadToBackblaze = async (file) => {
  console.log('Starting uploadToBackblaze'); // Log the start of the function
  console.log('File:', file); // Log the file object

  // Log environment variables for debugging
  console.log('B2_APPLICATION_KEY_ID:', process.env.B2_APPLICATION_KEY_ID);
  console.log('B2_APPLICATION_KEY:', process.env.B2_APPLICATION_KEY);
  console.log('B2_BUCKET_ID:', process.env.B2_BUCKET_ID);

  try {
    // Step 1: Authorize
    await b2.authorize();

    // Step 2: Get Upload URL
    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID,
    });
    const { uploadUrl, authorizationToken } = uploadUrlResponse.data;

    // Step 3: Upload File
    const uploadResponse = await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName: file.originalname,
      data: file.buffer, // Assuming file is passed in as a buffer
    });

    console.log('File uploaded successfully:', uploadResponse.data);

    if (!uploadResponse.data) {
      throw new Error('Response data is undefined');
    }

    const fileUrl = `https://f000.backblazeb2.com/file/${process.env.B2_BUCKET_NAME}/${uploadResponse.data.fileName}`;

    if (!fileUrl) {
      console.error('File URL is undefined'); // Log if fileUrl is undefined
      throw new Error('File URL is undefined');
    }

    return fileUrl;
  } catch (error) {
    console.error('Error uploading to Backblaze:', error);
    throw error;
  }
};

module.exports = { upload, uploadToBackblaze };