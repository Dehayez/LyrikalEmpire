import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useBeat } from '../../contexts';
import { startOfWeek, format } from 'date-fns';

const BeatStatisticsChart = () => {
  const { allBeats } = useBeat();

  const data = allBeats.reduce((acc, beat) => {
    const date = new Date(beat.created_at);
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const week = format(weekStart, 'yyyy-MM-dd');
    if (!acc[week]) {
      acc[week] = { date: week, beats: 0 };
    }
    acc[week].beats += 1;
    return acc;
  }, {});

  const chartData = Object.values(data);

  chartData.sort((a, b) => new Date(a.date) - new Date(b.date));

  const formatXAxis = (tickItem) => {
    return format(new Date(tickItem), 'MMM dd');
  };

  return (
    <LineChart width={600} height={300} data={chartData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="date" tickFormatter={formatXAxis} />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="beats" stroke="#FFCC44" activeDot={{ r: 8 }} />
    </LineChart>
  );
};

export default BeatStatisticsChart;