const { handleTransaction, handleQuery } = require('../helpers/dbHelpers');
const db = require('../config/db');
const { uploadToBackblaze } = require('../config/multer');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const B2 = require('backblaze-b2');

const b2 = new B2({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
  applicationKey: process.env.B2_APPLICATION_KEY,
});

const tableMap = {
  genres: 'beats_genres',
  moods: 'beats_moods',
  keywords: 'beats_keywords',
  features: 'beats_features',
  lyrics: 'beats_lyrics'
};

const getSignedUrl = async (req, res) => {
  const { fileName } = req.params;
  const { userId } = req.query;

  try {
    await b2.authorize();

    const filePath = `audio/users/${userId}/${fileName}`;

    const response = await b2.getDownloadAuthorization({
      bucketId: process.env.B2_BUCKET_ID,
      fileNamePrefix: filePath,
      validDurationInSeconds: 3600,
    });

    if (!response.data.authorizationToken) {
      throw new Error('Authorization token is missing in the response');
    }

    const signedUrl = `https://f003.backblazeb2.com/file/${process.env.B2_BUCKET_NAME}/${filePath}?Authorization=${response.data.authorizationToken}`;

    res.status(200).json({ signedUrl });
  } catch (error) {
    console.error('Error getting signed URL:', error);
    res.status(500).json({ error: 'An error occurred while getting the signed URL', details: error.message });
  }
};

const getTableName = (association_type, res) => {
  const tableName = tableMap[association_type];
  if (!tableName) {
    res.status(400).json({ error: 'Invalid association type' });
    return null;
  }
  return tableName;
};

const getBeats = (req, res) => {
  const { associationType, associationIds, user_id } = req.query;

  if (associationType && associationIds) {
    const tableName = getTableName(associationType, res);
    if (!tableName) return;

    const ids = associationIds.split(',').map(id => parseInt(id, 10));
    const placeholders = ids.map(() => '?').join(',');

    const query = `
      SELECT b.* FROM beats b
      JOIN ${tableName} bg ON b.id = bg.beat_id
      WHERE bg.${associationType.slice(0, -1)}_id IN (${placeholders}) AND b.user_id = ?
    `;

    handleQuery(query, [...ids, user_id], res, `Beats with ${associationType} fetched successfully`, true);
  } else {
    handleQuery('SELECT * FROM beats WHERE user_id = ? ORDER BY created_at DESC', [user_id], res, 'Beats fetched successfully', true);
  }
};

const createBeat = async (req, res) => {
  const { title, bpm, tierlist, duration, user_id } = req.body;
  const createdAt = new Date();

  try {
    if (!req.file) {
      throw new Error('No file uploaded');
    }

    const inputBuffer = req.file.buffer;
    const originalNameWithoutExt = path.parse(req.file.originalname).name;
    const inputFormat = path.extname(req.file.originalname).slice(1); // Get the file extension without the dot
    const outputPath = path.join(__dirname, '../uploads', `${originalNameWithoutExt}.aac`);

    // Convert the audio file to AAC format
    await convertToAAC(inputBuffer, outputPath, inputFormat);

    // Upload the converted file to Backblaze
    const audioFileName = await uploadToBackblaze({ path: outputPath, originalname: `${originalNameWithoutExt}.aac` }, user_id);

    // Delete the temporary file
    fs.unlinkSync(outputPath);

    const query = 'INSERT INTO beats (title, audio, bpm, tierlist, created_at, duration, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const params = [title, audioFileName, bpm, tierlist, createdAt, duration, user_id];

    handleQuery(query, params, res, 'Beat added successfully');
  } catch (error) {
    console.error('Error creating beat:', error);
    res.status(500).json({ error: 'An error occurred while creating the beat' });
  }
};

const convertToAAC = (inputBuffer, outputPath, inputFormat) => {
  // Create a temporary input file path
  const tempInputPath = path.join(__dirname, '../uploads', `temp-${Date.now()}.${inputFormat}`);

  return new Promise((resolve, reject) => {
    // Write the input buffer to a temporary file
    fs.writeFile(tempInputPath, inputBuffer, (writeErr) => {
      if (writeErr) {
        return reject(writeErr);
      }

      ffmpeg()
        .input(tempInputPath)
        .audioCodec('aac')
        .audioBitrate('192k')
        .toFormat('adts')
        .on('end', () => {
          // Clean up the temporary input file
          fs.unlink(tempInputPath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Error deleting temporary input file:', unlinkErr);
            }
          });
          
          resolve(outputPath);
        })
        .on('error', (err) => {
          // Clean up the temporary input file in case of error
          fs.unlink(tempInputPath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Error deleting temporary input file:', unlinkErr);
            }
          });
          
          reject(err);
        })
        .save(outputPath);
    });
  });
};

const getBeatById = (req, res) => {
  const { id } = req.params;
  handleQuery('SELECT * FROM beats WHERE id = ?', [id], res, 'Beat fetched successfully', true);
};

const updateBeat = (req, res) => {
  const { id } = req.params;
  const fields = ['title', 'bpm', 'tierlist', 'filePath'];
  const updates = [];
  const params = [];

  fields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(req.body[field]);
    }
  });

  if (updates.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  params.push(id);
  const query = `UPDATE beats SET ${updates.join(', ')} WHERE id = ?`;

  handleQuery(query, params, res, 'Beat updated successfully');
};

const deleteBeat = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  try {
    const [results] = await db.query('SELECT audio FROM beats WHERE id = ?', [id]);
    const fileName = results[0]?.audio;

    if (fileName) {
      // Construct the file path
      const filePath = `audio/users/${userId}/${fileName}`;
      console.log(`Deleting file at path: ${filePath}`);

      // Delete file from Backblaze B2
      await b2.authorize();

      // Retrieve the fileId from Backblaze B2
      const fileListResponse = await b2.listFileNames({
        bucketId: process.env.B2_BUCKET_ID,
        prefix: filePath,
        maxFileCount: 1,
      });

      console.log(`File list response: ${JSON.stringify(fileListResponse.data.files)}`);

      if (fileListResponse.data.files.length === 0) {
        throw new Error(`File not found: ${fileName}`);
      }

      const fileId = fileListResponse.data.files[0].fileId;
      console.log(`Deleting file with ID: ${fileId}`);

      await b2.deleteFileVersion({
        fileName: filePath,
        fileId: fileId,
      });
    }

    const queries = [
      { query: 'DELETE FROM playlists_beats WHERE beat_id = ?', params: [id] },
      { query: 'DELETE FROM beats_genres WHERE beat_id = ?', params: [id] },
      { query: 'DELETE FROM beats_moods WHERE beat_id = ?', params: [id] },
      { query: 'DELETE FROM beats_keywords WHERE beat_id = ?', params: [id] },
      { query: 'DELETE FROM beats_features WHERE beat_id = ?', params: [id] },
      { query: 'DELETE FROM beats WHERE id = ?', params: [id] }
    ];

    handleTransaction(queries, res, 'Beat and all associated data deleted successfully');
  } catch (error) {
    console.error(`Failed to delete beat with id: ${id}`, error);
    res.status(500).json({ error: 'An error occurred while deleting the beat' });
  }
};

const replaceAudio = async (req, res) => {
  const { id } = req.params;
  const newAudioFile = req.file;
  const { userId } = req.body;

  console.log('Received replace audio request with payload:', {
    id,
    newAudioFile: newAudioFile ? newAudioFile.originalname : null,
    userId,
  });

  if (!newAudioFile) {
    console.error('No audio file provided');
    return res.status(400).json({ error: 'No audio file provided' });
  }

  if (!userId) {
    console.error('User ID is required');
    return res.status(400).json({ error: 'User ID is required' });
  }

  try {
    const [results] = await db.query('SELECT audio FROM beats WHERE id = ?', [id]);
    const oldFilePath = results[0]?.audio;

    if (oldFilePath) {
      // Delete old file from Backblaze B2
      await b2.authorize();
      const fileName = oldFilePath.split('/').pop();
      console.log(`Deleting old file from Backblaze B2: ${fileName}`);

      const fileListResponse = await b2.listFileNames({
        bucketId: process.env.B2_BUCKET_ID,
        prefix: `audio/users/${userId}/${fileName}`,
        maxFileCount: 1,
      });

      if (fileListResponse.data.files.length === 0) {
        throw new Error(`File not found: ${fileName}`);
      }

      const fileId = fileListResponse.data.files[0].fileId;
      console.log(`Deleting file with ID: ${fileId}`);

      await b2.deleteFileVersion({
        fileName: `audio/users/${userId}/${fileName}`,
        fileId: fileId,
      });
    }

    const inputPath = newAudioFile.path;
    const outputPath = path.join(__dirname, '../uploads', `${newAudioFile.filename}.aac`);

    // Convert the audio file to AAC format
    await convertToAAC(inputPath, outputPath);

    // Upload the converted file to Backblaze
    const newFileUrl = await uploadToBackblaze({ path: outputPath, originalname: `${newAudioFile.filename}.aac` }, userId);

    // Delete the temporary files
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

    const query = 'UPDATE beats SET audio = ? WHERE id = ?';
    const params = [newFileUrl, id];

    await db.query(query, params);
    res.status(200).json({ message: 'Audio replaced successfully', fileUrl: newFileUrl });
  } catch (error) {
    console.error(`Failed to replace audio for beat with id: ${id}`, error);
    res.status(500).json({ error: 'An error occurred while replacing the audio' });
  }
};

const addAssociation = (req, res) => {
  const { beat_id, association_type } = req.params;
  const { association_id } = req.body;

  if (!association_id) {
    return res.status(400).json({ error: 'Association ID is required' });
  }

  const tableName = getTableName(association_type, res);
  if (!tableName) return;

  const columnName = association_type === 'lyrics' ? 'lyrics_id' : `${association_type.slice(0, -1)}_id`;
  const query = `INSERT INTO ${tableName} (beat_id, ${columnName}) VALUES (?, ?)`;
  const params = [beat_id, association_id];

  handleQuery(query, params, res, 'Association added successfully');
};

const removeAssociation = (req, res) => {
  const { beat_id, association_type, association_id } = req.params;

  const tableName = getTableName(association_type, res);
  if (!tableName) return;

  const query = `DELETE FROM ${tableName} WHERE beat_id = ? AND ${association_type.slice(0, -1)}_id = ?`;
  const params = [beat_id, association_id];

  handleQuery(query, params, res, 'Association removed successfully');
};

const getAssociations = (req, res) => {
  const { beat_id, association_type } = req.params;

  const tableName = getTableName(association_type, res);
  if (!tableName) return;

  const query = `SELECT * FROM ${tableName} WHERE beat_id = ?`;
  const params = [beat_id];

  handleQuery(query, params, res, 'Associations fetched successfully', true);
};

const removeAllAssociations = (req, res) => {
  const { beat_id, association_type } = req.params;

  const tableName = getTableName(association_type, res);
  if (!tableName) return;

  const query = `DELETE FROM ${tableName} WHERE beat_id = ?`;
  const params = [beat_id];

  handleQuery(query, params, res, 'All associations removed successfully');
};

module.exports = {
  getBeats,
  createBeat,
  getBeatById,
  updateBeat,
  deleteBeat,
  addAssociation,
  removeAssociation,
  getAssociations,
  removeAllAssociations,
  replaceAudio,
  getSignedUrl
};