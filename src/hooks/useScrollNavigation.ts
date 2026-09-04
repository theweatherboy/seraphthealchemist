"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useScrollNavigation(currentPageIndex: number, sequence: string[]) {
  const router = useRouter();

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      // Threshold to prevent accidental triggers
      if (Math.abs(event.deltaY) < 50) return;

      if (event.deltaY > 0 && currentPageIndex < sequence.length - 1) {
        // Scroll Down -> Next Page
        router.push(sequence[currentPageIndex + 1]);
      } else if (event.deltaY < 0 && currentPageIndex > 0) {
        // Scroll Up -> Previous Page
        router.push(sequence[currentPageIndex - 1]);
      }
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, [currentPageIndex, sequence, router]);
}
