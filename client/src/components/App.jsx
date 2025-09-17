import { useState, useEffect } from 'react'
import { useAnalytics } from '../hooks/useAnalytics';
import NavBar from './Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';

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
    </>
  )
}

export default App
