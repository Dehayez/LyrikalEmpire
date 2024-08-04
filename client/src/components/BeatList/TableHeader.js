import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { isMobileOrTablet } from '../../utils';
import { useResizableColumns } from '../../hooks';
import { addGenre, addMood, addKeyword, addFeature } from '../../services';
import { Form } from '../Form';
import { IoChevronUpSharp, IoChevronDownSharp, IoTimeOutline, IoAddSharp } from 'react-icons/io5';
import ContextMenu from '../ContextMenu/ContextMenu';
import './TableHeader.scss';

const TableHeader = ({ onSort, sortConfig, mode }) => {
  const tableRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeContextMenu, setActiveContextMenu] = useState(null);
  const [contextMenuPosition, setContextMenuPosition] = useState({ top: 0, left: 0 });
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('');

  useResizableColumns(tableRef, mode, setIsDragging);

  const handleMouseEvents = (eventName, columnName) => {
    if (eventName === 'click') {
      onSort && onSort(columnName);
    }
  };

  const columns = ['title', 'genre', 'bpm', 'tierlist', 'mood', 'keyword', 'feature'];

  const handleRightClick = (e, column) => {
    e.preventDefault();
    setActiveContextMenu(column);
    setContextMenuPosition({ top: e.clientY, left: e.clientX });
  };

  const handleOpenForm = (type) => {
    setFormType(type);
    setShowForm(true);
  };

  const handleSubmit = (data) => {
    switch (formType) {
      case 'genre':
        addGenre(data);
        break;
      case 'mood':
        addMood(data);
        break;
      case 'keywords':
        addKeyword(data);
        break;
      case 'features':
        addFeature(data);
        break;
      default:
        break;
    }
    setShowForm(false);
  };

  return (
    <thead className="table-header" ref={tableRef}>
      <tr>
        {!(mode === 'lock' && isMobileOrTablet()) && (
          <th className={`table-header__cell table-header__cell--center non-draggable`}>#</th>
        )}
        {columns.map(column => {
          if (mode === 'lock' && column !== 'title') {
            return null; 
          }
          return (
            <th key={column}
                onClick={() => handleMouseEvents('click', column)}
                onContextMenu={(e) => handleRightClick(e, column)}
                className={`table-header__cell ${isDragging ? 'no-transition' : ''}`}>
              {column === 'bpm' ? 'BPM' : column.charAt(0).toUpperCase() + column.slice(1)}
              {sortConfig.key === column && (
                <span className="table-header__sort-icon">
                  {sortConfig.direction === 'ascending' ? <IoChevronUpSharp /> : <IoChevronDownSharp />}
                </span>
              )}
              {(column === 'genre' || column === 'mood' || column === 'keyword' || column === 'feature') && (
                activeContextMenu === column && (
                  <ContextMenu
                    items={[
                      { 
                        icon: IoAddSharp,
                        text: `Add ${activeContextMenu}`, 
                        onClick: () => handleOpenForm(activeContextMenu) 
                      }
                    ]}
                    position={contextMenuPosition}
                    setActiveContextMenu={setActiveContextMenu}
                  />
                )
              )}
            </th>
          );
        })}
        {!(isMobileOrTablet() && mode === 'lock') && (
          <th className={`table-header__cell table-header__cell--center non-draggable`}><IoTimeOutline/></th>
        )}
        <th className={`table-header__cell table-header__cell--center non-draggable`}></th>
      </tr>
      {showForm && ReactDOM.createPortal (
        <Form
          title={`Add ${formType}`}
          placeholder={`Enter ${formType}`}
          item={formType}
          onClose={() => setShowForm(false)}
          onSubmit={handleSubmit}
        />,
        document.getElementById('modal-root')
      )}
    </thead>
  );
};

export default TableHeader;