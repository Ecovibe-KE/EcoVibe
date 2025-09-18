import { useCallback } from "react";
import { analytics } from "../../firebaseConfig";
import { logEvent as firebaseLogEvent } from "firebase/analytics";

/**
 * Custom hook for logging Firebase Analytics events.
 * @returns {{logEvent: (eventName: string, eventParams?: {[key: string]: any}) => void}}
 */
export const useAnalytics = () => {
  /**
   * A memoized function to log a Firebase Analytics event.
   * Checks if analytics is available before attempting to log.
   */
  const logEvent = useCallback((eventName, eventParams) => {
    if (analytics) {
      firebaseLogEvent(analytics, eventName, eventParams);
    } else {
      console.error("Firebase Analytics is not initialized.");
    }
  }, []);

  return { logEvent };
};
