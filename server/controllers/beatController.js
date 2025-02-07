const { handleTransaction, handleQuery } = require('../helpers/dbHelpers');
const db = require('../config/db');
const { uploadToBackblaze } = require('../config/multer');
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

  try {
    await b2.authorize();

    const response = await b2.getDownloadAuthorization({
      bucketId: process.env.B2_BUCKET_ID,
      fileNamePrefix: fileName,
      validDurationInSeconds: 3600,
    });

    const signedUrl = `https://f003.backblazeb2.com/file/${process.env.B2_BUCKET_NAME}/${fileName}?Authorization=${response.data.authorizationToken}`;

    res.status(200).json({ signedUrl });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
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

    const audioFileName = await uploadToBackblaze(req.file);

    const query = 'INSERT INTO beats (title, audio, bpm, tierlist, created_at, duration, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const params = [title, audioFileName, bpm, tierlist, createdAt, duration, user_id];

    handleQuery(query, params, res, 'Beat added successfully');
  } catch (error) {
    console.error('Error creating beat:', error);
    res.status(500).json({ error: 'An error occurred while creating the beat' });
  }
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

  try {
    const [results] = await db.query('SELECT audio FROM beats WHERE id = ?', [id]);
    const filePath = results[0]?.audio;

    if (filePath) {
      // Delete file from Backblaze B2
      await b2.authorize();
      const fileName = filePath.split('/').pop();

      // Retrieve the fileId from Backblaze B2
      const fileListResponse = await b2.listFileNames({
        bucketId: process.env.B2_BUCKET_ID,
        prefix: fileName,
        maxFileCount: 1,
      });

      if (fileListResponse.data.files.length === 0) {
        throw new Error(`File not found: ${fileName}`);
      }

      const fileId = fileListResponse.data.files[0].fileId;

      await b2.deleteFileVersion({
        fileName: fileName,
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

  if (!newAudioFile) {
    return res.status(400).json({ error: 'No audio file provided' });
  }

  try {
    const [results] = await db.query('SELECT audio FROM beats WHERE id = ?', [id]);
    const oldFilePath = results[0]?.audio;

    if (oldFilePath) {
      // Comment out local file deletion
      // const fullPath = path.join(__dirname, '../../client/public/uploads', oldFilePath);
      // fs.unlink(fullPath, (err) => {
      //   if (err) {
      //     console.error(`Failed to delete old audio file at path: ${fullPath}`, err);
      //   }
      // });

      // Delete old file from Backblaze B2
      await b2.authorize();
      const fileName = oldFilePath.split('/').pop();
      await b2.deleteFileVersion({
        fileName: fileName,
        fileId: oldFilePath.split('/').pop(),
      });
    }

    const newFileUrl = await uploadToBackblaze(newAudioFile);
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