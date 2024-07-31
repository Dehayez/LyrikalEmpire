import { useEffect } from 'react';
import { useSelectableList } from './useSelectableList';
import { addBeatAssociation, removeBeatAssociation } from '../../services';

export const useSelectableInput = (items, selectedItem, beat, handleUpdate, onUpdate, field) => {
  const selectableList = useSelectableList(items, selectedItem);

  useEffect(() => {
    if (selectableList.isBlurOrEnter) {
      handleUpdate(beat.id, field, selectableList.selectedItem);
      onUpdate(beat.id, field, selectableList.selectedItem);
    }
  }, [selectableList.isBlurOrEnter, selectableList.selectedItem]);

  return selectableList;
};