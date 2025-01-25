const multer = require('multer');
const b2 = require('./backblaze');

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const uploadToBackblaze = async (file) => {
  await b2.authorize();
  const bucketId = process.env.B2_BUCKET_ID;
  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const newFileName = `${uniqueSuffix}-${file.originalname}`;

  const response = await b2.uploadFile({
    bucketId: bucketId,
    fileName: newFileName,
    data: file.buffer,
  });

  return response.data.fileUrl;
};

module.exports = { upload, uploadToBackblaze };

// const storage = multer.diskStorage({
//   destination: function(req, file, cb) {
//     cb(null, path.join(__dirname, '../../client/public/uploads/'));
//   },
//   filename: function(req, file, cb) {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     const newFileName = uniqueSuffix + '-' + file.originalname;
//     cb(null, newFileName);
//     req.body.filePath = newFileName;
//   }
// });

// const upload = multer({ storage: storage });

// module.exports = upload;