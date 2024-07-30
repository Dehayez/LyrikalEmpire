const tierOrder = ['G', 'S', 'A', 'B', 'C', 'D', 'E', 'F', ' '];

export const sortBeats = (beats, sortConfig, originalOrder) => {
  if (!sortConfig) return originalOrder;

  return beats.sort((a, b) => {
    const { key, direction } = sortConfig;
    const valueA = a[key];
    const valueB = b[key];
    const isEmptyA = valueA === '' || valueA === null;
    const isEmptyB = valueB === '' || valueB === null;

    if (isEmptyA && isEmptyB) return 0;
    if (isEmptyA) return 1;
    if (isEmptyB) return -1;

    if (key === 'tierlist') {
      let indexA = tierOrder.indexOf(valueA);
      let indexB = tierOrder.indexOf(valueB);
      indexA = indexA === -1 ? tierOrder.length : indexA;
      indexB = indexB === -1 ? tierOrder.length : indexB;
      return direction === 'ascending' ? indexA - indexB : indexB - indexA;
    }

    if (valueA < valueB) return direction === 'ascending' ? -1 : 1;
    if (valueA > valueB) return direction === 'ascending' ? 1 : -1;
    return 0;
  });
};