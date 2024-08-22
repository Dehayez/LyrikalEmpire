import React, { useState, useEffect, useRef } from 'react';
import { AreaChart, Area, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useBeat, usePlaylist, useData } from '../../contexts';
import { startOfWeek, format } from 'date-fns';
import './StatChart.scss';

const StatChart = ({ hoveredCard, isCardHovered, filterOption }) => {
  const { allBeats } = useBeat();
  const { playlists } = usePlaylist();
  const { genres, moods, keywords, features } = useData();

  const [selectedData, setSelectedData] = useState(filterOption || 'beats');
  const [chartData, setChartData] = useState([]);
  const intervalRef = useRef(null);
  const chartRef = useRef(null);

  const resetInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (!isCardHovered && !chartRef.current?.contains(document.activeElement) && !filterOption) {
      intervalRef.current = setInterval(() => {
        setSelectedData((prevData) => {
          const currentIndex = options.findIndex(option => option.value === prevData);
          const nextIndex = (currentIndex + 1) % options.length;
          return options[nextIndex].value;
        });
      }, 8000);
    }
  };

  useEffect(() => {
    resetInterval();
    return () => clearInterval(intervalRef.current);
  }, [isCardHovered, filterOption]);

  useEffect(() => {
    if (hoveredCard) {
      setSelectedData(hoveredCard);
      resetInterval();
    }
  }, [hoveredCard]);

  const aggregateData = (data, key) => {
    return data.reduce((acc, item) => {
      const date = new Date(item.created_at);
      const weekStart = startOfWeek(date, { weekStartsOn: 1 });
      const week = format(weekStart, 'yyyy-MM-dd');
      if (!acc[week]) {
        acc[week] = { date: week, [key]: 0 };
      }
      acc[week][key] += 1;
      return acc;
    }, {});
  };

  const getData = () => {
    switch (selectedData) {
      case 'beats':
        return aggregateData(allBeats, 'beats');
      case 'playlists':
        return aggregateData(playlists, 'playlists');
      case 'genres':
        return aggregateData(genres, 'genres');
      case 'moods':
        return aggregateData(moods, 'moods');
      case 'keywords':
        return aggregateData(keywords, 'keywords');
      case 'features':
        return aggregateData(features, 'features');
      default:
        return {};
    }
  };

  useEffect(() => {
    const data = Object.values(getData());
    data.sort((a, b) => new Date(a.date) - new Date(b.date));
    setChartData(data);
  }, [selectedData, allBeats, playlists, genres, moods, keywords, features]);

  const handleMouseEnter = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const handleMouseLeave = () => {
    resetInterval();
  };

  return (
    <div className="stat-chart" ref={chartRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <Legend layout="horizontal" verticalAlign="top" align="center" wrapperStyle={{ paddingBottom: '20px' }} />
          <defs>
            <linearGradient id="colorData" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFCC44" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#FFCC44" stopOpacity={0} />
            </linearGradient>
          </defs>
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
          <Area type="monotone" dataKey={selectedData} stroke="#FFCC44" fill="url(#colorData)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const options = [
  { value: 'beats', label: 'Beats' },
  { value: 'playlists', label: 'Playlists' },
  { value: 'genres', label: 'Genres' },
  { value: 'moods', label: 'Moods' },
  { value: 'keywords', label: 'Keywords' },
  { value: 'features', label: 'Features' }
];

export default StatChart;