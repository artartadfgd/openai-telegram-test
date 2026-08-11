"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const TOUR_STEP_KEYS = [
  "dashboard",
  "aiCoach",
  "trainingBuilder",
  "library",
  "teams",
  "players",
  "calendar",
  "season",
] as const;

export type TourStepKey = (typeof TOUR_STEP_KEYS)[number];

const SEEN_KEY = "coachai-tour-seen";

type TourContextValue = {
  active: boolean;
  stepIndex: number;
  totalSteps: number;
  currentKey: TourStepKey;
  start: () => void;
  next: () => void;
  back: () => void;
  skip: () => void;
};

const TourContext = createContext<TourContextValue | null>(null);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem(SEEN_KEY);
    if (seen) return;
    const timer = setTimeout(() => {
      window.localStorage.setItem(SEEN_KEY, "1");
      setStepIndex(0);
      setActive(true);
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  const start = useCallback(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(SEEN_KEY, "1");
    setStepIndex(0);
    setActive(true);
  }, []);

  const next = useCallback(() => {
    setStepIndex((i) => {
      if (i + 1 >= TOUR_STEP_KEYS.length) {
        setActive(false);
        return i;
      }
      return i + 1;
    });
  }, []);

  const back = useCallback(() => {
    setStepIndex((i) => Math.max(0, i - 1));
  }, []);

  const skip = useCallback(() => {
    setActive(false);
  }, []);

  const value = useMemo<TourContextValue>(
    () => ({
      active,
      stepIndex,
      totalSteps: TOUR_STEP_KEYS.length,
      currentKey: TOUR_STEP_KEYS[stepIndex],
      start,
      next,
      back,
      skip,
    }),
    [active, stepIndex, start, next, back, skip]
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function useTour() {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error("useTour must be used within a TourProvider");
  return ctx;
}
