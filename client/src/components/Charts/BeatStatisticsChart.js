import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useBeat, usePlaylist, useData } from '../../contexts';
import { startOfWeek, format } from 'date-fns';

const BeatStatisticsChart = () => {
  const { allBeats } = useBeat();
  const { playlists } = usePlaylist();
  const { genres, moods, keywords, features } = useData();

  const [selectedData, setSelectedData] = useState('beats');

  const handleDataChange = (event) => {
    setSelectedData(event.target.value);
  };

  const getData = () => {
    switch (selectedData) {
      case 'beats':
        return allBeats.reduce((acc, beat) => {
          const date = new Date(beat.created_at);
          const weekStart = startOfWeek(date, { weekStartsOn: 1 });
          const week = format(weekStart, 'yyyy-MM-dd');
          if (!acc[week]) {
            acc[week] = { date: week, beats: 0 };
          }
          acc[week].beats += 1;
          return acc;
        }, {});
      case 'playlists':
        return playlists.reduce((acc, playlist) => {
          const date = new Date(playlist.created_at);
          const weekStart = startOfWeek(date, { weekStartsOn: 1 });
          const week = format(weekStart, 'yyyy-MM-dd');
          if (!acc[week]) {
            acc[week] = { date: week, playlists: 0 };
          }
          acc[week].playlists += 1;
          return acc;
        }, {});
      case 'genres':
        return genres.reduce((acc, genre) => {
          const date = new Date(genre.created_at);
          const weekStart = startOfWeek(date, { weekStartsOn: 1 });
          const week = format(weekStart, 'yyyy-MM-dd');
          if (!acc[week]) {
            acc[week] = { date: week, genres: 0 };
          }
          acc[week].genres += 1;
          return acc;
        }, {});
      case 'moods':
        return moods.reduce((acc, mood) => {
          const date = new Date(mood.created_at);
          const weekStart = startOfWeek(date, { weekStartsOn: 1 });
          const week = format(weekStart, 'yyyy-MM-dd');
          if (!acc[week]) {
            acc[week] = { date: week, moods: 0 };
          }
          acc[week].moods += 1;
          return acc;
        }, {});
      case 'keywords':
        return keywords.reduce((acc, keyword) => {
          const date = new Date(keyword.created_at);
          const weekStart = startOfWeek(date, { weekStartsOn: 1 });
          const week = format(weekStart, 'yyyy-MM-dd');
          if (!acc[week]) {
            acc[week] = { date: week, keywords: 0 };
          }
          acc[week].keywords += 1;
          return acc;
        }, {});
      case 'features':
        return features.reduce((acc, feature) => {
          const date = new Date(feature.created_at);
          const weekStart = startOfWeek(date, { weekStartsOn: 1 });
          const week = format(weekStart, 'yyyy-MM-dd');
          if (!acc[week]) {
            acc[week] = { date: week, features: 0 };
          }
          acc[week].features += 1;
          return acc;
        }, {});
      default:
        return {};
    }
  };

  const data = getData();
  const chartData = Object.values(data);
  chartData.sort((a, b) => new Date(a.date) - new Date(b.date));

  const formatXAxis = (tickItem) => {
    return format(new Date(tickItem), 'MMM dd');
  };

  return (
    <div>
      <select value={selectedData} onChange={handleDataChange}>
        <option value="beats">Beats</option>
        <option value="playlists">Playlists</option>
        <option value="genres">Genres</option>
        <option value="moods">Moods</option>
        <option value="keywords">Keywords</option>
        <option value="features">Features</option>
      </select>
      <LineChart width={600} height={300} data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tickFormatter={formatXAxis} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey={selectedData} stroke="#FFCC44" activeDot={{ r: 8 }} />
      </LineChart>
    </div>
  );
};

export default BeatStatisticsChart;