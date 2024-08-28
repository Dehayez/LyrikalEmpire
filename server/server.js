require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, '../client/public/uploads')));

const keywordRoutes = require('./routes/keywordRoute');
const moodRoutes = require('./routes/moodRoute');
const featureRoutes = require('./routes/featureRoute');
const playlistRoutes = require('./routes/playlistRoute');
const beatRoutes = require('./routes/beatRoute');
const genreRoutes = require('./routes/genreRoute');

app.use('/api/keywords', keywordRoutes);
app.use('/api/moods', moodRoutes);
app.use('/api/features', featureRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/beats', beatRoutes);
app.use('/api/genres', genreRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});