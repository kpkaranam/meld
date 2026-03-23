import { useState, useEffect } from 'react';

export function useIntersectionObserver(options?: IntersectionObserverInit) {
  const [ref, setRef] = useState<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(ref); // Only animate once
      }
    }, options);

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, options]);

  return { setRef, isVisible };
}
