import { useEffect } from 'react';
import { useSelectableList } from './useSelectableList';

export const useSelectableListWithUpdate = (items, selectedItem, beat, handleUpdate, onUpdate, field) => {
  const selectableList = useSelectableList(items, selectedItem);

  useEffect(() => {
    if (selectableList.selectedItem) {
      handleUpdate(beat.id, field, selectableList.selectedItem);
      onUpdate(beat.id, field, selectableList.selectedItem);
    }
  }, [selectableList.selectedItem]);

  return selectableList;
};