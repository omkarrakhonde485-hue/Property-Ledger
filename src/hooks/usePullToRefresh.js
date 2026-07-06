import { useEffect, useRef, useState } from 'react';

export default function usePullToRefresh(onRefresh, containerRef) {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(0);
  const pulling = useRef(false);

  useEffect(() => {
    const el = containerRef?.current || document.getElementById('main-scroll');
    if (!el) return;

    const onTouchStart = (e) => {
      if (el.scrollTop === 0) {
        startY.current = e.touches[0].clientY;
        pulling.current = true;
      }
    };

    const onTouchMove = (e) => {
      if (!pulling.current) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy > 60 && !refreshing) {
        setRefreshing(true);
        pulling.current = false;
        Promise.resolve(onRefresh()).finally(() => setRefreshing(false));
      }
    };

    const onTouchEnd = () => { pulling.current = false; };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    el.addEventListener('touchend', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [onRefresh, refreshing, containerRef]);

  return refreshing;
}