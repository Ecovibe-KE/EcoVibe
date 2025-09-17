import { Button } from 'react-bootstrap';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';

/**
 * A reusable button component that displays an icon and a label.
 *
 * @param {object} props - The component's props.
 * @param {string} props.label - The text to display on the button.
 * @param {string} props.action - The type of action the button performs (e.g., 'add', 'update', 'delete', 'view'). This determines the icon and color of the button.
 * @param {string} [props.variant] - The button's visual style (e.g., 'solid', 'outline').
 * @param {Function} props.onClick - The function to call when the button is clicked.
 * @param {object} [props.style] - Additional CSS styles to apply to the button.
 * @param {JSX.Element} [props.icon] - Optional custom icon to display instead of the default action icon.
 * @returns {JSX.Element} The rendered button component.
 */
const ActionButton = ({ label, action, variant, onClick, style, icon, showIcon = true }) => {
    
  const icons = {
        add: <AddIcon />,
        update: <EditIcon />,
        delete: <DeleteForeverIcon />,
        view: <RemoveRedEyeIcon />,
    }

  const styles = {
    ...style,
    margin: '2.5px',
    alignItems: 'center',
    display: 'inline-flex',
    justifyContent: 'center',
  }

  const variantMap = {
    add: 'success',
    update: 'warning',
    delete: 'danger',
    view: 'dark',
  };

  const buttonVariant = variant === 'outlined' ? `outline-${variantMap[action]}` : variantMap[action];

  const visibleIcon = showIcon ? (icon ?? icons[action]) : null;

  return (
    <Button
      style={styles}
      variant={buttonVariant}
      onClick={onClick}
      aria-label={label}>
        {visibleIcon} <span style={{marginLeft: '5px'}}>{label}</span>
    </Button>
  );
}

export { ActionButton }
