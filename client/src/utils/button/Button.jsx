import React from 'react';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import './Button.css';



/**
 * A reusable button component that displays an icon and a label.
 *
 * @param {object} props - The component's props.
 * @param {string} props.label - The text to display on the button.
 * @param {string} props.action - The type of action the button performs (e.g., 'add', 'update', 'delete', 'view'). This determines the icon displayed.
 * @param {string} [props.variant="solid"] - The button's visual style (e.g., 'solid', 'outline').
 * @param {Function} props.onClick - The function to call when the button is clicked.
 * @param {object} [props.style] - Custom styles to apply to the button.
 * @returns {JSX.Element} The rendered button component.
 */
const ActionButton = ({ label, action, variant = "solid", onClick, style }) => {
    
  const icons = {
        add: <AddIcon />,
        update: <EditIcon />,
        delete: <DeleteForeverIcon />,
        view: <RemoveRedEyeIcon />,
    }

  const styles = {
    ...style,
    margin: '5px',
  }

  return (
    <button
      style={styles} 
      className={`action-button ${variant} ${action}`}
      onClick={onClick}
      aria-label={label}>
        {icons[action]} <span>{label}</span>
    </button>
  );
}


export { ActionButton }