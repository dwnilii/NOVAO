"use client"

import React, { useEffect, useState } from "react";

const BUBBLE_COUNT = 15;

export function BackgroundBubbles() {
  const [bubbles, setBubbles] = useState<React.ReactNode[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const generateBubbles = () => {
      const newBubbles = Array.from({ length: BUBBLE_COUNT }).map((_, i) => {
        const size = `${Math.random() * 4 + 1}rem`; // 1rem to 5rem
        const left = `${Math.random() * 100}%`;
        const animationDuration = `${Math.random() * 15 + 20}s`; // 20s to 35s
        const animationDelay = `${Math.random() * 15}s`;

        return (
          <div
            key={i}
            className="absolute top-full rounded-full bg-accent/30 animate-bubble"
            style={{
              width: size,
              height: size,
              left: left,
              animationDuration,
              animationDelay,
              boxShadow: '0 0 50px 20px hsl(var(--accent) / 0.4)',
            }}
          />
        );
      });
      setBubbles(newBubbles);
    }
    generateBubbles();
  }, [isMounted]);

  return (
    <div className="fixed inset-0 z-0 h-full w-full pointer-events-none overflow-hidden bg-background">
      {bubbles}
    </div>
  );
}
