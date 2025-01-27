const multer = require('multer');
const B2 = require('backblaze-b2');
const path = require('path');

const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
});

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const uploadToBackblaze = async (file) => {
  try {
    // Authorize
    await b2.authorize();

    // Generate a unique file name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const newFileName = `${uniqueSuffix}-${file.originalname}`;

    // Get Upload URL
    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID,
    });
    const { uploadUrl, authorizationToken } = uploadUrlResponse.data;

    // Upload File
    const uploadResponse = await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName: newFileName,
      data: file.buffer,
    });

    if (!uploadResponse.data) {
      throw new Error('Response data is undefined');
    }

    return uploadResponse.data.fileName;
  } catch (error) {
    console.error('Error uploading to Backblaze:', error);
    throw error;
  }
};

module.exports = { upload, uploadToBackblaze };