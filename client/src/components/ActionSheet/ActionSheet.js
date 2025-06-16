import React, { useState } from 'react';
import ActionSheet from './ActionSheet';
import { IoTrashOutline, IoShareOutline, IoCheckmarkCircleOutline } from 'react-icons/io5';

const MyComponent = () => {
  const [showActionSheet, setShowActionSheet] = useState(false);

  const actionItems = [
    {
      text: 'Select All',
      icon: IoCheckmarkCircleOutline,
      onClick: () => {
        console.log('Select all clicked');
        // Your select all logic here
      }
    },
    {
      text: 'Clear Selection',
      onClick: () => {
        console.log('Clear selection clicked');
        // Your clear logic here
      }
    },
    {
      text: 'Share Selected',
      icon: IoShareOutline,
      onClick: () => {
        console.log('Share clicked');
        // Your share logic here
      }
    },
    {
      text: 'Delete Selected',
      icon: IoTrashOutline,
      destructive: true, // This will make the text red
      onClick: () => {
        console.log('Delete clicked');
        // Your delete logic here
      }
    }
  ];

  return (
    <div>
      <button onClick={() => setShowActionSheet(true)}>
        Show Actions
      </button>

      <ActionSheet
        items={actionItems}
        isVisible={showActionSheet}
        onClose={() => setShowActionSheet(false)}
        title="Actions" // Optional title
      />
    </div>
  );
};

export default MyComponent;