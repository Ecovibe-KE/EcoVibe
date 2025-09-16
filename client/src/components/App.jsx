import { useState, useEffect } from 'react'
import { useAnalytics } from '../hooks/useAnalytics';
import { ActionButton } from '../utils/button/Button';


function App() {
  // 1. Get the logEvent function from the hook
  const { logEvent } = useAnalytics();

  // 2. Log a screen_view event when the component mounts
  useEffect(() => {
    logEvent('screen_view', {
      firebase_screen: 'Home Page',
      firebase_screen_class: 'App'
    });
  }, [logEvent]); // Add logEvent to dependency array

  const [count, setCount] = useState(0)

  return (
    <>
    <p>Welcome to Ecovibe</p>
    <p>Something good is coming soon!</p>
    <p>This is a sample of how to use the custom buttons</p>

    <div>
      <ActionButton label="Add Item" action="add" variant="solid" showIcon={false}  onClick={() => setCount(count + 1)} />
      <ActionButton label="Update Item" action="update" variant="outlined" onClick={() => setCount(count + 1)} />
      <ActionButton label="Delete Item" action="delete" variant="solid" onClick={() => setCount(count - 1)} />
      <ActionButton label="View Item" action="view" variant="outlined" onClick={() => alert(`Current count is ${count}`)} />
    </div>

    </>
  )
}

export default App
