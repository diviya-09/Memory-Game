import { useEffect, useState } from "react";

export default function useTimer(start, running, onEnd, resetKey = 0) {
  const [time, setTime] = useState(start);

  useEffect(() => {
    setTime(start);
  }, [start, resetKey]);

  useEffect(() => {
    if (!running) return undefined;

    const id = setInterval(() => {
      setTime((value) => {
        if (value <= 1) {
          clearInterval(id);
          onEnd?.();
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [running, onEnd]);

  return time;
}
