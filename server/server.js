// Import required modules
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const multer = require('multer');
const path = require('path');

// Create an Express app
const app = express();
const expressPort = 4000;

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
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'lyrikalempire',
  port: 8889
});

// Define the /api/tracks endpoint handlers
app.get('/api/tracks', (req, res) => {
  db.query('SELECT * FROM tracks', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching tracks' });
    } else {
      res.json(results);
    }
  });
});

app.post('/api/tracks', upload.single('audio'), (req, res) => {
  const { title, bpm, genre, tierlist, mood, keywords, filePath } = req.body;
  db.query('INSERT INTO tracks (title, audio, bpm, genre, tierlist, mood, keywords) VALUES (?, ?, ?, ?, ?, ?, ?)', 
  [title, filePath, bpm, genre, tierlist, mood, keywords], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while adding the track' });
    } else {
      res.status(201).json(results);
    }
  });
});

app.delete('/api/tracks/:id', (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM tracks WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while deleting the track' });
    } else {
      res.status(200).json(results);
    }
  });
});

// Connect to the database and start the server
db.connect(err => {
  if (err) {
    console.error('An error occurred while connecting to the database:', err);
    process.exit(1);
  }

  app.listen(expressPort, () => {
    console.log(`Server is running on port ${expressPort}`);
  });
});