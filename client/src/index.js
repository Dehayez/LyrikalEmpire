import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.scss';
import App from './App';
import { PlaylistProvider } from './contexts/PlaylistContext'; 
import reportWebVitals from './reportWebVitals';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <PlaylistProvider> 
        <App />
      </PlaylistProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();