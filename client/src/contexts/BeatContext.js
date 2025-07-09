import React, { createContext, useContext, useState, useEffect } from 'react';
import { getBeats } from '../services';
import { useUser } from '../contexts';

const BeatContext = createContext();

export const useBeat = () => useContext(BeatContext);

export const BeatProvider = ({ children }) => {
  const [allBeats, setAllBeats] = useState([]);
  const [beats, setBeats] = useState([]);
  const [currentBeats, setCurrentBeats] = useState([]);
  const [paginatedBeats, setPaginatedBeats] = useState([]);
  const [hoveredBeat, setHoveredBeat] = useState(null);
  const [refreshBeats, setRefreshBeats] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const fetchBeats = async () => {
      try {
        const data = await getBeats(user.id);
        
        // 🧪 TEST: Log the first beat to see if associations are included
        if (data && data.length > 0) {
          console.log('🎵 Beat with associations:', data[0]);
          console.log('📊 Beat genres:', data[0].genres);
          console.log('😊 Beat moods:', data[0].moods);
          console.log('🔑 Beat keywords:', data[0].keywords);
          console.log('⭐ Beat features:', data[0].features);
          console.log('📝 Beat lyrics:', data[0].lyrics);
        }
        
        setAllBeats(data);
        setBeats(data);
      } catch (error) {
        console.error('Failed to fetch beats:', error);
      }
    };

    if (user.id) {
      fetchBeats();
    }
  }, [refreshBeats, user.id]);

  return (
    <BeatContext.Provider value={{ allBeats, beats, setBeats, setGlobalBeats: setAllBeats, paginatedBeats, setPaginatedBeats, hoveredBeat, setHoveredBeat, setRefreshBeats, currentBeats, setCurrentBeats }}>
      {children}
    </BeatContext.Provider>
  );
};