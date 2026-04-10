import { useCallback, useRef } from 'react';

/**
 * Hook to handle both click and touch events for better mobile support
 * Prevents double-firing and handles touch delays
 */
export function useMobileClick<T extends HTMLElement = HTMLElement>(
  onClick: (e: React.MouseEvent<T> | React.TouchEvent<T>) => void,
  options: { preventDefault?: boolean; stopPropagation?: boolean } = {}
) {
  const touchStartRef = useRef<number>(0);
  const touchEndRef = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent<T>) => {
    touchStartRef.current = Date.now();
    if (options.preventDefault) e.preventDefault();
    if (options.stopPropagation) e.stopPropagation();
  }, [options.preventDefault, options.stopPropagation]);

  const handleTouchEnd = useCallback((e: React.TouchEvent<T>) => {
    touchEndRef.current = Date.now();
    const touchDuration = touchEndRef.current - touchStartRef.current;
    
    // Only trigger if touch was quick (< 500ms) to avoid accidental triggers
    if (touchDuration < 500) {
      onClick(e);
    }
    
    if (options.preventDefault) e.preventDefault();
    if (options.stopPropagation) e.stopPropagation();
  }, [onClick, options.preventDefault, options.stopPropagation]);

  const handleClick = useCallback((e: React.MouseEvent<T>) => {
    // Prevent click if touch event just fired (within 300ms)
    const timeSinceTouch = Date.now() - touchEndRef.current;
    if (timeSinceTouch > 300) {
      onClick(e);
    }
    
    if (options.preventDefault) e.preventDefault();
    if (options.stopPropagation) e.stopPropagation();
  }, [onClick, options.preventDefault, options.stopPropagation]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
    onClick: handleClick,
  };
}
