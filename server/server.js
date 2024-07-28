require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, '../client/public/uploads')));

const db = mysql.createConnection({
  host: process.env.DB_HOST, 
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME, 
  port: process.env.DB_PORT 
});

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../client/public/uploads/'));
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const newFileName = uniqueSuffix + '-' + file.originalname;
    cb(null, newFileName);
    // Prepend a slash to the filePath
    req.body.filePath = '/' + path.join('uploads', newFileName);
  }
});

const upload = multer({ storage: storage });

app.get('/api/beats', (req, res) => {
  db.query('SELECT * FROM beats ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching beats' });
    } else {
      res.json(results);
    }
  });
});

app.post('/api/beats', upload.single('audio'), (req, res) => {
  const { title, bpm, genre, tierlist, mood, keywords, feature, filePath, duration } = req.body;
  const createdAt = new Date();
  db.query('INSERT INTO beats (title, audio, bpm, genre, tierlist, mood, keywords, feature, created_at, duration) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', 
  [title, filePath, bpm, genre, tierlist, mood, keywords, feature, createdAt, duration], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while adding the beat' });
    } else {
      res.status(201).json(results);
    }
  });
});

app.get('/api/beats/:id', (req, res) => {
  const { id } = req.params;

  db.query('SELECT * FROM beats WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching the beat' });
    } else {
      res.json(results);
    }
  });
});

app.put('/api/beats/:id', (req, res) => {
  const { id } = req.params;
  let updatedBeat = { ...req.body, edited_at: new Date().toISOString() };

  delete updatedBeat.created_at;

  updatedBeat.edited_at = updatedBeat.edited_at.replace('T', ' ').split('.')[0];

  let updateQuery = 'UPDATE beats SET ';
  let queryParams = [];

  for (let key in updatedBeat) {
    if (key !== 'beat_order') {
      updateQuery += `${key} = ?, `;
      queryParams.push(updatedBeat[key]);
    }
  }

  updateQuery = updateQuery.slice(0, -2);
  updateQuery += ' WHERE id = ?';
  queryParams.push(id);

  db.query(updateQuery, queryParams, (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while updating the beat' });
    } else {
      res.json(results);
    }
  });
});

app.delete('/api/beats/:id', (req, res) => {
  const { id } = req.params;

  db.beginTransaction(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred starting the transaction' });
    }

    db.query('DELETE FROM playlist_beats WHERE beat_id = ?', [id], (err, results) => {
      if (err) {
        console.error(err);
        return db.rollback(() => {
          res.status(500).json({ error: 'An error occurred while removing the beat from playlists' });
        });
      }

      db.query('DELETE FROM beats WHERE id = ?', [id], (err, results) => {
        if (err) {
          console.error(err);
          return db.rollback(() => {
            res.status(500).json({ error: 'An error occurred while deleting the beat' });
          });
        }

        db.commit(err => {
          if (err) {
            console.error(err);
            return db.rollback(() => {
              res.status(500).json({ error: 'An error occurred while committing the transaction' });
            });
          }

          res.json({ message: 'Beat deleted successfully' });
        });
      });
    });
  });
});

// Get Genres
app.get('/api/genres', (req, res) => {
  db.query('SELECT * FROM genres', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching genres' });
    } else {
      res.json(results);
    }
  });
});

// Add Genre
app.post('/api/genres', (req, res) => {
  const { name } = req.body;
  db.query('INSERT INTO genres (name) VALUES (?)', [name], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while adding the genre' });
    } else {
      res.status(201).json({ message: 'Genre added successfully', genreId: results.insertId });
    }
  });
});

// Update Genre
app.put('/api/genres/:id', (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  db.query('UPDATE genres SET name = ? WHERE id = ?', [name, id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while updating the genre' });
    } else {
      res.json({ message: 'Genre updated successfully' });
    }
  });
});

// Delete Genre
app.delete('/api/genres/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM genres WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while deleting the genre' });
    } else {
      res.json({ message: 'Genre deleted successfully' });
    }
  });
});

// Get Keywords
app.get('/api/keywords', (req, res) => {
  db.query('SELECT * FROM keywords', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching keywords' });
    } else {
      res.json(results);
    }
  });
});


// Add Keyword
app.post('/api/keywords', (req, res) => {
  const { name } = req.body;
  db.query('INSERT INTO keywords (name) VALUES (?)', [name], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while adding the keyword' });
    } else {
      res.status(201).json({ message: 'Keyword added successfully', keywordId: results.insertId });
    }
  });
});

// Update Keyword
app.put('/api/keywords/:id', (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  db.query('UPDATE keywords SET name = ? WHERE id = ?', [name, id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while updating the keyword' });
    } else {
      res.json({ message: 'Keyword updated successfully' });
    }
  });
});

// Delete Keyword
app.delete('/api/keywords/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM keywords WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while deleting the keyword' });
    } else {
      res.json({ message: 'Keyword deleted successfully' });
    }
  });
});

// Get Moods
app.get('/api/moods', (req, res) => {
  db.query('SELECT * FROM moods', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching moods' });
    } else {
      res.json(results);
    }
  });
});
// Add Mood
app.post('/api/moods', (req, res) => {
  const { name } = req.body;
  db.query('INSERT INTO moods (name) VALUES (?)', [name], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while adding the mood' });
    } else {
      res.status(201).json({ message: 'Mood added successfully', moodId: results.insertId });
    }
  });
});

// Update Mood
app.put('/api/moods/:id', (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  db.query('UPDATE moods SET name = ? WHERE id = ?', [name, id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while updating the mood' });
    } else {
      res.json({ message: 'Mood updated successfully' });
    }
  });
});

// Delete Mood
app.delete('/api/moods/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM moods WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while deleting the mood' });
    } else {
      res.json({ message: 'Mood deleted successfully' });
    }
  });
});

// Get Features
app.get('/api/features', (req, res) => {
  db.query('SELECT * FROM features', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching features' });
    } else {
      res.json(results);
    }
  });
});

// Add Feature
app.post('/api/features', (req, res) => {
  const { name } = req.body;
  db.query('INSERT INTO features (name) VALUES (?)', [name], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while adding the feature' });
    } else {
      res.status(201).json({ message: 'Feature added successfully', featureId: results.insertId });
    }
  });
});

// Update Feature
app.put('/api/features/:id', (req, res) => {
  const { name } = req.body;
  const { id } = req.params;
  db.query('UPDATE features SET name = ? WHERE id = ?', [name, id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while updating the feature' });
    } else {
      res.json({ message: 'Feature updated successfully' });
    }
  });
});

// Delete Feature
app.delete('/api/features/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM features WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while deleting the feature' });
    } else {
      res.json({ message: 'Feature deleted successfully' });
    }
  });
});

// Create Playlist
app.post('/api/playlists', (req, res) => {
  const { title, description } = req.body;
  db.query('INSERT INTO playlists (title, description) VALUES (?, ?)', [title, description], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while creating the playlist' });
    } else {
      res.status(201).json({ message: 'Playlist created successfully', playlistId: results.insertId });
    }
  });
});

// Get Playlists
app.get('/api/playlists', (req, res) => {
  db.query('SELECT * FROM playlists ORDER BY created_at DESC', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching playlists' });
    } else {
      res.json(results);
    }
  });
});

// Get Playlist by ID
app.get('/api/playlists/:id', (req, res) => {
  const { id } = req.params;
  db.query('SELECT * FROM playlists WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching the playlist' });
    } else {
      if (results.length === 0) {
        res.status(404).json({ error: 'Playlist not found' });
      } else {
        res.json(results[0]);
      }
    }
  });
});

// Update Playlist
app.put('/api/playlists/:id', (req, res) => {
  const { title, description } = req.body;
  const { id } = req.params;
  db.query('UPDATE playlists SET title = ?, description = ? WHERE id = ?', [title, description, id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while updating the playlist' });
    } else {
      res.json({ message: 'Playlist updated successfully' });
    }
  });
});


// Delete Playlist and associated beats
app.delete('/api/playlists/:id', (req, res) => {
  const { id } = req.params;
  
  // First, delete all beats associated with the playlist
  db.query('DELETE FROM playlist_beats WHERE playlist_id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while removing beats from the playlist' });
    } else {
      // After successfully deleting beats, delete the playlist
      db.query('DELETE FROM playlists WHERE id = ?', [id], (err, results) => {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'An error occurred while deleting the playlist' });
        } else {
          res.json({ message: 'Playlist deleted successfully' });
        }
      });
    }
  });
});

// Add Beat to Playlist
app.post('/api/playlists/:playlist_id/beats/:beat_id', (req, res) => {
  const { playlist_id, beat_id } = req.params;
  db.query('INSERT INTO playlist_beats (playlist_id, beat_id) VALUES (?, ?)', [playlist_id, beat_id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while adding the beat to the playlist' });
    } else {
      res.status(201).json({ message: 'Beat added to playlist successfully' });
    }
  });
});

// Remove Beat from Playlist
app.delete('/api/playlists/:playlist_id/beats/:beat_id', (req, res) => {
  const { playlist_id, beat_id } = req.params;
  db.query('DELETE FROM playlist_beats WHERE playlist_id = ? AND beat_id = ?', [playlist_id, beat_id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while removing the beat from the playlist' });
    } else {
      res.json({ message: 'Beat removed from playlist successfully' });
    }
  });
});

// Get Beats in Playlist
app.get('/api/playlists/:playlist_id/beats', (req, res) => {
  const { playlist_id } = req.params;
  db.query(
    'SELECT b.*, pb.beat_order FROM beats b INNER JOIN playlist_beats pb ON b.id = pb.beat_id WHERE pb.playlist_id = ? ORDER BY pb.beat_order',
    [playlist_id],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while fetching beats in the playlist' });
      } else {
        res.json(results);
      }
    }
  );
});

app.post('/api/playlists/:playlist_id/beats', (req, res) => {
  const { playlist_id } = req.params;
  const { beatIds } = req.body;
  
  const insertValues = beatIds.map(beatId => [playlist_id, beatId]);

  db.beginTransaction(err => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'An error occurred starting the transaction' });
    }

    // Increment the order of existing beats
    db.query('UPDATE playlist_beats SET beat_order = beat_order + 1 WHERE playlist_id = ?', [playlist_id], (err) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json({ error: 'An error occurred while updating the beat order' });
        });
      }

      const checkAndInsertPromises = insertValues.map(([playlistId, beatId]) => 
        new Promise((resolve, reject) => {
          db.query('SELECT 1 FROM playlist_beats WHERE playlist_id = ? AND beat_id = ?', [playlistId, beatId], (err, results) => {
            if (err) {
              return reject(err);
            }
            if (results.length === 0) { 
              db.query('INSERT INTO playlist_beats (playlist_id, beat_id, beat_order) VALUES (?, ?, 0)', [playlistId, beatId], (err, results) => {
                if (err) {
                  return reject(err);
                }
                resolve();
              });
            } else {
              resolve();
            }
          });
        })
      );

      Promise.all(checkAndInsertPromises)
        .then(() => {
          db.commit(err => {
            if (err) {
              console.error(err);
              db.rollback(() => {
                res.status(500).json({ error: 'An error occurred while committing the transaction' });
              });
            } else {
              res.status(201).json({ message: 'Beats added to playlist successfully, duplicates avoided' });
            }
          });
        })
        .catch(err => {
          console.error(err);
          db.rollback(() => {
            res.status(500).json({ error: 'An error occurred while adding the beats to the playlist' });
          });
        });
    });
  });
});

app.put('/api/playlists/:playlist_id/beats/order', (req, res) => {
  const { playlist_id } = req.params;
  const { beatOrders } = req.body;

  const queries = beatOrders.map(({ id, order }) => {
    return new Promise((resolve, reject) => {
      db.query('UPDATE playlist_beats SET beat_order = ? WHERE playlist_id = ? AND beat_id = ?', [order, playlist_id, id], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
  });

  Promise.all(queries)
    .then(() => res.json({ message: 'Beat order updated successfully' }))
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while updating the beat order' });
    });
});

app.delete('/api/playlists/:id/beats', (req, res) => {
  const { id } = req.params;
  const deleteQuery = 'DELETE FROM playlist_beats WHERE playlist_id = ?';

  db.query(deleteQuery, [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while deleting beats from the playlist' });
    } else {
      res.status(200).json({ message: 'All beats removed from playlist successfully' });
    }
  });
});

db.connect(err => {
  if (err) {
    console.error('An error occurred while connecting to the database:', err);
    process.exit(1);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
  });
});