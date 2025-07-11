import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';

import { PlaylistProvider, BeatProvider, DataProvider, HeaderWidthProvider, UserProvider, WebSocketProvider } from './contexts'; 

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <UserProvider>
        <WebSocketProvider>
          <PlaylistProvider> 
            <BeatProvider>
              <DataProvider>
                <HeaderWidthProvider>
                  <DndProvider backend={HTML5Backend}>
                    <App />
                  </DndProvider>
                </HeaderWidthProvider>
              </DataProvider>
            </BeatProvider>
          </PlaylistProvider>
        </WebSocketProvider>
      </UserProvider>
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();