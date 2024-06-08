const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const expressPort = 4000;

app.use(cors());
app.use(bodyParser.json());

// Create a connection to the database
const db = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'root',
  database: 'lyrikalempire',
  port: 8889 // This remains the same as your MySQL server is running on this port
});

// Define the /api/tracks endpoint handlers
app.get('/api/tracks', (req, res) => {
  // Query the database and return the result
  db.query('SELECT * FROM tracks', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while fetching tracks' });
    } else {
      res.json(results);
    }
  });
});

app.post('/api/tracks', (req, res) => {
  // Insert a new track into the database
  const { title, audio, bpm, genre, tierlist, mood, keywords } = req.body;
  db.query('INSERT INTO tracks (title, audio, bpm, genre, tierlist, mood, keywords) VALUES (?, ?, ?, ?, ?, ?, ?)', 
  [title, audio, bpm, genre, tierlist, mood, keywords], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'An error occurred while adding the track' });
    } else {
      res.status(201).json(results);
    }
  });
});

app.delete('/api/tracks/:id', (req, res) => {
  // Delete a track from the database
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

// Connect to the database
db.connect(err => {
  if (err) {
    console.error('An error occurred while connecting to the database:', err);
    process.exit(1);
  }

  // Start the Express server
  app.listen(expressPort, () => {
    console.log(`Server is running on port ${expressPort}`);
  });
});