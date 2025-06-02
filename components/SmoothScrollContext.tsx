"use client";

import { useState, useEffect, createContext, useContext } from "react";

import Lenis from "lenis";

const SmoothScrollContext = createContext<Lenis | null>(null);

export const useSmoothScroll = () => {
  return useContext(SmoothScrollContext);
};

export default function ScrollContext({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lenisRef, setLenisRef] = useState<Lenis | null>(null);
  let rafId: number | null = null; // Store requestAnimationFrame ID

  useEffect(() => {
    const scroller = new Lenis();

    function raf(time: number) {
      scroller.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);
    setLenisRef(scroller);

    return () => {
      // Check if rafId has a value before cancelling
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      scroller.destroy(); // Use scroller directly as lenisRef might be stale
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <SmoothScrollContext.Provider value={lenisRef}>
      {children}
    </SmoothScrollContext.Provider>
  );
}