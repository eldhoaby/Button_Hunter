import { useEffect, useRef, useState } from 'react';
import type { MousePosition } from '../types';

interface UseMousePositionReturn {
  position: MousePosition;
  distanceTraveled: number;
}

export function useMousePosition(): UseMousePositionReturn {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [distanceTraveled, setDistanceTraveled] = useState(0);

  const posRef = useRef<MousePosition>({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const pendingPos = useRef<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      pendingPos.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (touch) {
        pendingPos.current = { x: touch.clientX, y: touch.clientY };
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    const loop = () => {
      const prev = posRef.current;
      const next = pendingPos.current;

      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d > 0.5) {
        posRef.current = next;
        setPosition(next);
        setDistanceTraveled((prev) => prev + d);
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return { position, distanceTraveled };
}
