const multer = require('multer');
const B2 = require('backblaze-b2');
const path = require('path');
const fs = require('fs');

const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const uploadToBackblaze = async (file, userId) => {
  try {
    await b2.authorize();

    // Generate a unique identifier
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

    // Extract the original file name and extension
    const originalFileName = path.basename(file.originalname, path.extname(file.originalname));
    const fileExtension = path.extname(file.originalname);

    // Construct the new file name with the unique identifier
    const newFileName = `${uniqueSuffix}-${originalFileName}${fileExtension}`;

    // Define the file path with folders
    const filePath = `audio/users/${userId}/${newFileName}`;

    console.log('Uploading file to Backblaze B2:', filePath);

    // Get Upload URL
    const uploadUrlResponse = await b2.getUploadUrl({
      bucketId: process.env.B2_BUCKET_ID,
    });
    const { uploadUrl, authorizationToken } = uploadUrlResponse.data;

    // Read the file buffer
    const fileBuffer = fs.readFileSync(file.path);

    // Upload File
    const uploadResponse = await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName: filePath,
      data: fileBuffer,
    });

    if (!uploadResponse.data) {
      throw new Error('Response data is undefined');
    }

    console.log('Upload response:', uploadResponse.data);

    // Return only the file name
    return newFileName;
  } catch (error) {
    console.error('Error uploading to Backblaze:', error);
    throw error;
  }
};

module.exports = { upload, uploadToBackblaze };