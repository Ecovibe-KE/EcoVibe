import React, { useState } from 'react';
import CategoryIcon from '@mui/icons-material/Category';

export const DropdownButton = ({ options, selected, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="btn-group">
      <button
        type="button"
        className="btn btn-light dropdown-toggle border rounded-3 text-secondary"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <CategoryIcon className="me-2" style={{ fontSize: '1.2rem', verticalAlign: 'middle' }} />
        {selected}
      </button>

      {isOpen && (
        <ul className="dropdown-menu show rounded-3 shadow-lg" style={{ position: 'absolute', transform: 'translate(0px, 40px)', zIndex: 1000 }}>
          {options.map((option) => (
            <li key={option}>
              <a
                className="dropdown-item"
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onSelect(option);
                  setIsOpen(false);
                }}
              >
                {option}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};