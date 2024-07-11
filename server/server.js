require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Add this at the top of your file if it's not already there

// Create an Express app
const app = express();
const port = 4000;

// Middleware for parsing JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware for handling CORS
app.use(cors());

// Middleware for serving static files
app.use('/uploads', express.static(path.join(__dirname, '../client/public/uploads')));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, path.join(__dirname, '../client/public/uploads/'));
  },
  filename: function(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const newFileName = uniqueSuffix + '-' + file.originalname;
    cb(null, newFileName);
    req.body.filePath = path.join('uploads', newFileName);
  }
});
const upload = multer({ storage: storage });

// Create a connection to the database
const db = mysql.createConnection({
  host: process.env.DB_HOST, 
  user: process.env.DB_USER, 
  password: process.env.DB_PASSWORD, 
  database: process.env.DB_NAME, 
  port: process.env.DB_PORT 
});

// Define the /api/beats endpoint handlers
app.get('/api/beats', (req, res) => {
  db.query('SELECT * FROM beats', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching beats' });
    } else {
      res.json(results);
    }
  });
});

app.post('/api/beats', upload.single('audio'), (req, res) => {
  const { title, bpm, genre, tierlist, mood, keywords, filePath } = req.body;
  const createdAt = new Date();
  db.query('INSERT INTO beats (title, audio, bpm, genre, tierlist, mood, keywords, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', 
  [title, filePath, bpm, genre, tierlist, mood, keywords, createdAt], (err, results) => {
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
  let updatedBeat = { ...req.body, edited_at: new Date() };

  // Format the date correctly for MySQL
  for (let key in updatedBeat) {
    if (key === 'created_at' || key === 'edited_at') {
      const date = new Date(updatedBeat[key]);
      updatedBeat[key] = date.toISOString().split('.')[0].replace('T', ' ').replace('Z', '');
    }
  }

  let updateQuery = 'UPDATE beats SET ';
  let queryParams = [];

  for (let key in updatedBeat) {
    updateQuery += `${key} = ?, `;
    queryParams.push(updatedBeat[key]);
  }

  // Remove the last comma and space
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
  
  // Fetch the beat's details
  db.query('SELECT * FROM beats WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching the beat' });
    } else {
      // Extract the file path
      const filePath = path.join(__dirname, '../client/public', results[0].audio);
      
      // Delete the file
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error(`An error occurred while deleting the file at path ${filePath}:`, err);
          res.status(500).json({ error: 'An error occurred while deleting the audio file' });
        } else {
          // Delete the beat from the database
          db.query('DELETE FROM beats WHERE id = ?', [id], (err, results) => {
            if (err) {
              console.error(err);
              res.status(500).json({ error: 'An error occurred while deleting the beat' });
            } else {
              res.status(200).json(results);
            }
          });
        }
      });
    }
  });
});

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

db.connect(err => {
  if (err) {
    console.error('An error occurred while connecting to the database:', err);
    process.exit(1);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server is running on port ${port}`);
  });
});