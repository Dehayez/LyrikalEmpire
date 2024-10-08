export const getInitialState = (key, defaultState) => {
  const savedState = localStorage.getItem(key);
  try {
    return savedState ? JSON.parse(savedState) : defaultState;
  } catch (e) {
    return savedState || defaultState;
  }
};

export const getInitialStateForFilters = (filters, initialValue) => {
  return filters.reduce((acc, filter) => {
    acc[filter.name] = initialValue;
    return acc;
  }, {});
};