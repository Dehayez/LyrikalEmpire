import React from 'react';
import './History.scss';

const History = () => {
  const history = JSON.parse(localStorage.getItem('playedBeatsHistory') || '[]');

  return (
    <div className="history">
       <ul>
          {history.map((beat, index) => (
            <li key={index}>{beat.title}</li> // Assuming each beat has a 'name' property
          ))}
        </ul>
    </div>
  );
};

export default History;