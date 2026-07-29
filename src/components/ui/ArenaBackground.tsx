// ═══════════════════════════════════════════════════════════════
// BUTTON HUNTER — Living Arena Background
// Canvas-based animated hex grid with particles and bloom
// ═══════════════════════════════════════════════════════════════

import React, { useEffect, useRef } from 'react';

interface ArenaBackgroundProps {
  chaos?: number;       // 0–1, increases visual intensity
  frozen?: boolean;     // Time-freeze visual
  isSecret?: boolean;   // Secret event — bg goes sentient
}

export const ArenaBackground: React.FC<ArenaBackgroundProps> = ({
  chaos = 0,
  frozen = false,
  isSecret = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>(0);
  const timeRef   = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Ambient particles
    const particles: { x: number; y: number; vx: number; vy: number; size: number; life: number; maxLife: number; hue: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3 - 0.15,
        size: Math.random() * 2 + 0.5,
        life: Math.random(),
        maxLife: 1,
        hue: Math.random() * 40 + 180, // cyan/blue range
      });
    }

    const HEX_SIZE = 48;
    const HEX_H   = HEX_SIZE * Math.sqrt(3);
    const HEX_W   = HEX_SIZE * 2;

    function drawHex(x: number, y: number, size: number, alpha: number, hue: number) {
      ctx!.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 6;
        const px = x + size * Math.cos(angle);
        const py = y + size * Math.sin(angle);
        i === 0 ? ctx!.moveTo(px, py) : ctx!.lineTo(px, py);
      }
      ctx!.closePath();
      ctx!.strokeStyle = `hsla(${hue}, 100%, 60%, ${alpha})`;
      ctx!.lineWidth = 0.5;
      ctx!.stroke();
    }

    function draw(time: number) {
      const w = canvas!.width;
      const h = canvas!.height;
      const dt = (time - timeRef.current) / 1000;
      timeRef.current = time;

      if (frozen) {
        // Ice-blue overlay when frozen
        ctx!.fillStyle = 'rgba(0, 30, 60, 0.15)';
      } else if (isSecret) {
        // Eerie green when secret
        ctx!.fillStyle = 'rgba(0, 20, 5, 0.12)';
      } else {
        ctx!.fillStyle = `rgba(4, 5, 15, ${0.12 + chaos * 0.04})`;
      }
      ctx!.fillRect(0, 0, w, h);

      const t = time / 1000;

      // ── Layered gradient orbs ──────────────────────────────────
      const orbData = [
        { x: 0.15 + Math.sin(t * 0.17) * 0.08, y: 0.2  + Math.cos(t * 0.11) * 0.06, color: isSecret ? '120, 100%, 35%' : '195, 100%, 50%', r: 0.35 },
        { x: 0.80 + Math.cos(t * 0.13) * 0.07, y: 0.75 + Math.sin(t * 0.09) * 0.05, color: isSecret ? '90, 100%, 25%'  : '280, 80%, 45%',  r: 0.30 },
        { x: 0.50 + Math.sin(t * 0.07) * 0.12, y: 0.50 + Math.cos(t * 0.15) * 0.08, color: isSecret ? '60, 100%, 20%'  : '330, 90%, 40%',  r: 0.25 },
      ];

      for (const orb of orbData) {
        const gx = orb.x * w;
        const gy = orb.y * h;
        const gr = Math.max(w, h) * orb.r;
        const grad = ctx!.createRadialGradient(gx, gy, 0, gx, gy, gr);
        grad.addColorStop(0,   `hsla(${orb.color}, ${0.06 + chaos * 0.04})`);
        grad.addColorStop(0.5, `hsla(${orb.color}, ${0.02 + chaos * 0.02})`);
        grad.addColorStop(1,   `hsla(${orb.color}, 0)`);
        ctx!.fillStyle = grad;
        ctx!.fillRect(0, 0, w, h);
      }

      // ── Scrolling hex grid ────────────────────────────────────
      const scrollY = (t * 12) % (HEX_H * 1.5);
      const cols = Math.ceil(w / (HEX_W * 0.75)) + 2;
      const rows = Math.ceil(h / HEX_H) + 4;

      for (let row = -2; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const xOff   = col % 2 === 0 ? 0 : HEX_H * 0.5;
          const hexX   = col * HEX_W * 0.75;
          const hexY   = row * HEX_H + xOff + scrollY - HEX_H * 2;

          // Proximity to center for depth effect
          const distToCenter = Math.sqrt(
            Math.pow((hexX - w / 2) / w, 2) +
            Math.pow((hexY - h / 2) / h, 2)
          );
          const alpha = Math.max(0, 0.04 - distToCenter * 0.06 + chaos * 0.025);
          const hue   = isSecret ? 120 + Math.sin(t * 0.5 + row) * 30
                                 : 190 + Math.sin(t * 0.3 + col * 0.5) * 20;

          if (alpha > 0.005) drawHex(hexX, hexY, HEX_SIZE - 2, alpha, hue);
        }
      }

      // ── Horizontal scan lines ─────────────────────────────────
      const scanY = (t * 60) % h;
      const scanGrad = ctx!.createLinearGradient(0, scanY - 40, 0, scanY + 40);
      scanGrad.addColorStop(0,   'rgba(0, 245, 255, 0)');
      scanGrad.addColorStop(0.5, `rgba(0, 245, 255, ${0.015 + chaos * 0.01})`);
      scanGrad.addColorStop(1,   'rgba(0, 245, 255, 0)');
      ctx!.fillStyle = scanGrad;
      ctx!.fillRect(0, scanY - 40, w, 80);

      // Second slower scan
      const scanY2 = (t * 25 + h * 0.4) % h;
      const scanGrad2 = ctx!.createLinearGradient(0, scanY2 - 30, 0, scanY2 + 30);
      scanGrad2.addColorStop(0,   'rgba(155, 93, 229, 0)');
      scanGrad2.addColorStop(0.5, `rgba(155, 93, 229, ${0.01 + chaos * 0.008})`);
      scanGrad2.addColorStop(1,   'rgba(155, 93, 229, 0)');
      ctx!.fillStyle = scanGrad2;
      ctx!.fillRect(0, scanY2 - 30, w, 60);

      // ── Ambient particles ─────────────────────────────────────
      for (const p of particles) {
        if (frozen) {
          p.life -= dt * 0.1;
        } else {
          p.x += p.vx * (1 + chaos * 2);
          p.y += p.vy * (1 + chaos * 2);
          p.life -= dt * 0.06;
        }

        if (p.life <= 0) {
          p.x = Math.random() * w;
          p.y = h + 10;
          p.life = 0.8 + Math.random() * 0.2;
          p.vx = (Math.random() - 0.5) * 0.4;
          p.vy = -(Math.random() * 0.4 + 0.1);
          p.hue = isSecret ? 120 + Math.random() * 40 : Math.random() * 40 + 180;
        }

        if (p.x < 0 || p.x > w) { p.x = Math.random() * w; }

        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        const hue = frozen ? 200 : p.hue;
        ctx!.fillStyle = `hsla(${hue}, 100%, 70%, ${p.life * 0.6})`;
        ctx!.shadowBlur = 6;
        ctx!.shadowColor = `hsla(${hue}, 100%, 60%, 0.5)`;
        ctx!.fill();
        ctx!.shadowBlur = 0;
      }

      // ── Vignette ──────────────────────────────────────────────
      const vignette = ctx!.createRadialGradient(w/2, h/2, 0, w/2, h/2, Math.max(w, h) * 0.7);
      vignette.addColorStop(0,   'rgba(0,0,0,0)');
      vignette.addColorStop(0.6, 'rgba(0,0,0,0)');
      vignette.addColorStop(1,   `rgba(0,0,0,${0.4 + chaos * 0.25})`);
      ctx!.fillStyle = vignette;
      ctx!.fillRect(0, 0, w, h);

      // ── Chaos electric arcs (high chaos) ─────────────────────
      if (chaos > 0.5) {
        for (let i = 0; i < 2; i++) {
          if (Math.random() < chaos * 0.05) {
            ctx!.beginPath();
            ctx!.moveTo(Math.random() * w, Math.random() * h);
            ctx!.lineTo(Math.random() * w, Math.random() * h);
            ctx!.strokeStyle = `rgba(0, 245, 255, ${Math.random() * 0.2})`;
            ctx!.lineWidth = Math.random() + 0.5;
            ctx!.stroke();
          }
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [chaos, frozen, isSecret]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        display: 'block',
        filter: isSecret ? 'hue-rotate(120deg)' : frozen ? 'saturate(0.3) brightness(0.7)' : 'none',
        transition: 'filter 1s ease',
      }}
    />
  );
};
