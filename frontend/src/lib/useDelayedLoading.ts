import { useState, useEffect, useRef } from "react";

export function useDelayedLoading(loading: boolean, delay = 200): boolean {
  const [show, setShow] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (loading) {
      timer.current = setTimeout(() => setShow(true), delay);
    } else {
      if (timer.current) clearTimeout(timer.current);
      setShow(false);
    }
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [loading, delay]);

  return show;
}
