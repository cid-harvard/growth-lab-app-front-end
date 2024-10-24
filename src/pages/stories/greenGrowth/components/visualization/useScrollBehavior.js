import { useEffect } from "react";

export const useScrollBehavior = (onScroll) => {
  useEffect(() => {
    let touchStartY = 0;

    const handleWheel = (e) => {
      e.preventDefault();
      onScroll(e.deltaY);
    };

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchMove = (e) => {
      e.preventDefault();
      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY - touchEndY;
      onScroll(deltaY);
      touchStartY = touchEndY;
    };

    return {
      onWheel: handleWheel,
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
    };
  }, [onScroll]);
};
