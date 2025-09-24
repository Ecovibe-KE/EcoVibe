import { useState, useEffect } from "react";

// Hook: true if screen is >= breakpoint (Bootstrap style)
const useBreakpoint = (breakpoint = "lg") => {
  const breakpoints = { sm: 576, md: 768, lg: 992, xl: 1200, xxl: 1400 };
  const bp = breakpoints[breakpoint] || 992;

  const [isUp, setIsUp] = useState(window.innerWidth >= bp);

  useEffect(() => {
    const handleResize = () => setIsUp(window.innerWidth >= bp);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [bp]);

  return isUp;
};

export default useBreakpoint;
