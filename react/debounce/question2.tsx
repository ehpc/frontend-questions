import React, { useRef, useCallback, useEffect } from 'react';

export function useDebounceCallback<T extends (...args: any[]) => any>(
  cb: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const cbRef = useRef<T>(cb);

  useEffect(() => {
    cbRef.current = cb;
  }, [cb]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return useCallback((...args: Parameters<T>) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      cbRef.current(...args)
    }, delay);
  }, [delay]);
}