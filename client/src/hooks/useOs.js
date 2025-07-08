import { useMemo } from 'react';

const useOs = () => {
  return useMemo(() => {
    if (typeof window === 'undefined' || !window.navigator) return 'windows';
    const platform = window.navigator.platform.toLowerCase();
    if (platform.includes('mac')) return 'mac';
    return 'windows';
  }, []);
};

export default useOs; 