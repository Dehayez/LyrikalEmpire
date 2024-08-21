import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useBeat, usePlaylist, useData } from '../../contexts';
import { startOfWeek, format } from 'date-fns';

const StatChart = () => {
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
    return format(new Date(tickItem), 'dd MMM');
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
      <AreaChart width={600} height={300} data={chartData}>
        <defs>
          <linearGradient id="colorData" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FFCC44" stopOpacity={0.8} />
            <stop offset="100%" stopColor="#FFCC44" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="date" tickFormatter={formatXAxis} />
        <YAxis />
        <Tooltip 
          contentStyle={{ backgroundColor: '#202020', borderColor: '#202020', borderRadius: '4px', border: '1px solid #383838', display: 'flex', alignItems: 'center' }} 
          itemStyle={{ color: '#fff' }} 
          labelFormatter={(label) => format(new Date(label), 'dd MMM')}
          formatter={(value, name) => [`${value}`, `${name}`]}
          cursor={{ stroke: 'transparent', strokeWidth: 1 }}
          content={({ payload, label }) => {
            if (payload && payload.length) {
              return (
                <div style={{ backgroundColor: '#202020', border: '1px solid #383838', borderRadius: '4px', padding: '10px', color: '#fff', display: 'flex', alignItems: 'center' }}>
                  <span>{format(new Date(label), 'dd MMM')}</span>
                  <div style={{ height: '20px', width: '1px', backgroundColor: '#383838', margin: '0 10px' }}></div>
                  <span>{payload[0].value}</span>
                </div>
              );
            }
            return null;
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey={selectedData}
          stroke="#FFCC44"
          fillOpacity={.6}
          fill="url(#colorData)"
          activeDot={{ stroke: '#FFCC44', strokeWidth: 2, fill: '#FFCC44', r: 4 }}
        />
      </AreaChart>
    </div>
  );
};

export default StatChart;