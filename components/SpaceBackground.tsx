"use client";

import { useEffect, useRef } from "react";

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      baseAlpha: number;
      alpha: number;
      pulseSpeed: number;
      pulseTime: number;
      isNode: boolean;

      constructor(isNode = false) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Restored original movement speed
        this.vx = (Math.random() - 0.5) * 0.15;
        this.vy = (Math.random() - 0.5) * 0.15;
        this.radius = isNode ? Math.random() * 2 + 2 : Math.random() * 1 + 0.5;

        // Restored original base alpha
        this.baseAlpha = isNode ? Math.random() * 0.4 + 0.4 : Math.random() * 0.3 + 0.2;
        this.alpha = this.baseAlpha;

        // Restored original pulse speed
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
        this.pulseTime = Math.random() * Math.PI * 2;
        this.isNode = isNode;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        this.pulseTime += this.pulseSpeed;
        // Restored original twinkle amplitude
        this.alpha = this.baseAlpha + Math.sin(this.pulseTime) * 0.15;
      }

      draw(c: CanvasRenderingContext2D) {
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        if (this.isNode) {
          // Restored original glows
          c.shadowBlur = 10;
          c.shadowColor = "rgba(0, 245, 212, 0.4)";
          c.fillStyle = `rgba(0, 245, 212, ${this.alpha})`;
        } else {
          c.shadowBlur = 4;
          c.shadowColor = "rgba(56, 189, 248, 0.3)";
          c.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        }

        c.fill();
        c.shadowBlur = 0;
      }
    }

    const init = () => {
      particles = [];
      // Restored original particle count density
      const count = Math.floor((width * height) / 11000);
      const cappedCount = Math.min(count, 150);

      for (let i = 0; i < cappedCount; i++) {
        const isNode = Math.random() < 0.12;
        particles.push(new Particle(isNode));
      }
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      init();
    };

    window.addEventListener("resize", handleResize);
    init();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Restored original connections layout and color values
      ctx.strokeStyle = "rgba(124, 58, 237, 0.035)";
      ctx.lineWidth = 0.8;

      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.15;
            ctx.strokeStyle = `rgba(124, 58, 237, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none -z-20 bg-[#020617]">
      {/* 1. Base Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-[#020617] via-[#071129] to-[#0b1020]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-transparent to-[#020617] opacity-80" />

      {/* 2. Large Blurred Gradient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vh] max-w-[800px] bg-[#00f5d4]/4 rounded-full blur-[140px] mix-blend-screen animate-pulse" style={{ animationDuration: '12s' }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[65vw] h-[65vh] max-w-[900px] bg-[#00b4ff]/4 rounded-full blur-[150px] mix-blend-screen" />
      <div className="absolute top-[20%] right-[-5%] w-[50vw] h-[55vh] max-w-[700px] bg-[#7c3aed]/5 rounded-full blur-[130px] mix-blend-screen animate-pulse" style={{ animationDuration: '18s' }} />
      <div className="absolute bottom-[20%] left-[-5%] w-[45vw] h-[45vh] max-w-[600px] bg-[#38bdf8]/4 rounded-full blur-[120px] mix-blend-screen" />

      {/* 3. Horizontal Aurora Streaks */}
      <div className="absolute w-[200%] h-[300px] top-[15%] left-[-50%] bg-gradient-to-r from-transparent via-[#00b4ff]/2 via-[#7c3aed]/1 to-transparent blur-[80px] -skew-y-3 animate-aurora pointer-events-none opacity-30" />
      <div className="absolute w-[200%] h-[200px] bottom-[25%] left-[-50%] bg-gradient-to-r from-transparent via-[#00f5d4]/1 via-[#38bdf8]/2 to-transparent blur-[70px] skew-y-6 animate-aurora-slow pointer-events-none opacity-20" />

      {/* 4. Interactive Canvas (Stars, Neural Net) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-60 mix-blend-screen"
      />

      {/* 5. Soft Atmospheric Spotlight Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(56,189,248,0.03),transparent_60%)]" />
    </div>
  );
}
