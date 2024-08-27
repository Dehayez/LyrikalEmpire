require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const db = require('./config/db');
const upload = require('./config/multer');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, '../client/public/uploads')));

// Import routes
const keywordsRoutes = require('./routes/keywords');
const moodsRoutes = require('./routes/moods');
const featuresRoutes = require('./routes/features');
const playlistsRoutes = require('./routes/playlists');
const beatsRoutes = require('./routes/beats');
const genresRoutes = require('./routes/genres');

// Use routes
app.use('/api/keywords', keywordsRoutes);
app.use('/api/moods', moodsRoutes);
app.use('/api/features', featuresRoutes);
app.use('/api/playlists', playlistsRoutes);
app.use('/api/beats', beatsRoutes);
app.use('/api/genres', genresRoutes);

const PORT = process.env.PORT || 4000;
db.connect(err => {
  if (err) {
    console.error('An error occurred while connecting to the database:', err);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});