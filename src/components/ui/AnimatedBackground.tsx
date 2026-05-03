import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface Orb {
  element: HTMLDivElement;
  x: number;
  y: number;
}

export function AnimatedBackground() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const orbs: Orb[] = [];

    // Subtle steel-blue orb configs — no bright colors
    const orbConfigs = [
      { size: 400, color: 'rgba(30, 64, 175, 0.06)', startX: 15, startY: 20 },
      { size: 350, color: 'rgba(30, 58, 138, 0.05)', startX: 75, startY: 60 },
      { size: 300, color: 'rgba(37, 99, 235, 0.04)', startX: 50, startY: 80 },
    ];

    orbConfigs.forEach((config) => {
      const orb = document.createElement('div');
      orb.style.cssText = `
        position: absolute;
        width: ${config.size}px;
        height: ${config.size}px;
        border-radius: 50%;
        background: radial-gradient(circle, ${config.color} 0%, transparent 70%);
        filter: blur(60px);
        left: ${config.startX}%;
        top: ${config.startY}%;
        transform: translate(-50%, -50%);
        will-change: transform;
      `;
      container.appendChild(orb);
      orbs.push({ element: orb, x: config.startX, y: config.startY });
    });

    orbs.forEach((orb, index) => {
      const duration = 14 + index * 5;
      const xRange = 15 + index * 4;
      const yRange = 10 + index * 3;

      gsap.to(orb.element, {
        x: `+=${xRange}%`,
        y: `+=${yRange}%`,
        duration: duration,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
      });
    });

    return () => {
      orbs.forEach((orb) => {
        gsap.killTweensOf(orb.element);
        if (orb.element.parentNode) {
          orb.element.parentNode.removeChild(orb.element);
        }
      });
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
