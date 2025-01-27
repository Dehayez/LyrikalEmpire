const multer = require('multer');
const B2 = require('backblaze-b2');

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

    // Get Upload URL
    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID,
    });
    const { uploadUrl, authorizationToken } = uploadUrlResponse.data;

    // Upload File
    const uploadResponse = await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName: file.originalname,
      data: file.buffer,
    });

    if (!uploadResponse.data) {
      throw new Error('Response data is undefined');
    }

    const fileUrl = `https://f000.backblazeb2.com/file/${process.env.B2_BUCKET_NAME}/${uploadResponse.data.fileName}`;

    if (!fileUrl) {
      throw new Error('File URL is undefined');
    }

    return fileUrl;
  } catch (error) {
    console.error('Error uploading to Backblaze:', error);
    throw error;
  }
};

module.exports = { upload, uploadToBackblaze };