"use client";
import { useState, useCallback } from "react";

type CalibrationState = "idle" | "first_point" | "done";

interface Point {
  x: number;
  y: number;
}

export function useCalibration() {
  const [state, setState] = useState<CalibrationState>("idle");
  const [point1, setPoint1] = useState<Point | null>(null);
  const [point2, setPoint2] = useState<Point | null>(null);

  const handleClick = useCallback(
    (x: number, y: number) => {
      if (state === "idle") {
        setPoint1({ x, y });
        setState("first_point");
      } else if (state === "first_point") {
        setPoint2({ x, y });
        setState("done");
      }
    },
    [state]
  );

  const reset = useCallback(() => {
    setState("idle");
    setPoint1(null);
    setPoint2(null);
  }, []);

  return { state, point1, point2, handleClick, reset };
}
