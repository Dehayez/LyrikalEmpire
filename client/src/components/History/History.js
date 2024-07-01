import React from 'react';
import './History.scss';

const History = () => {
  const history = JSON.parse(localStorage.getItem('playedBeatsHistory') || '[]');

  return (
    <div className="history">
       <ul className='history__list'>
          {history.map((beat, index) => (
            <li className='history__list-item' key={index}>{beat.title}</li>
          ))}
        </ul>
    </div>
  );
};

export default History;