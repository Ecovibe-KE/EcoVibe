import { useState, useEffect } from "react";

// Hook: true if screen is >= breakpoint (Bootstrap style)
const useBreakpoint = (breakpoint = "lg") => {
  const breakpoints = { sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1400 };
  const bp = breakpoints[breakpoint] || 992;

  const getIsUp = () =>
    typeof window !== "undefined" ? window.innerWidth >= bp : false;
  const [isUp, setIsUp] = useState(getIsUp);

  useEffect(() => {
    const handleResize = () =>
      setIsUp(typeof window !== "undefined" && window.innerWidth >= bp);
    // Recalculate once on mount or when `bp` changes
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [bp]);

  return isUp;
};

export default useBreakpoint;
