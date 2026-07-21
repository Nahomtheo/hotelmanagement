'use client';

import React, { useState, useEffect } from 'react';

export default function ThreeDBackground() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Normalize coordinate offsets between -1 and 1
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
      
      setCoords({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden bg-black [perspective:1000px] flex flex-col justify-between p-8 md:p-16 text-white select-none">
      
      {/* LAYER 1: 3D INTERACTIVE BACKGROUND */}
      <div
        className="absolute inset-0 transition-transform duration-500 ease-out will-change-transform pointer-events-none"
        style={{
          transform: `rotateX(${coords.y * -8}deg) rotateY(${coords.x * 8}deg) scale(1.12)`,
        }}
      >
        <img
          src="hotel-bg.jpg"
          alt="Ethiopian Coffee Ceremony"
          className="w-full h-full object-cover object-[center_45%]"
        />
        
        {/* Cinematic Overlays bound to the background layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/95" />
        <div 
          className="absolute inset-0 mix-blend-screen opacity-60"
          style={{
            background: `radial-gradient(circle at 50% 35%, rgba(210, 140, 60, 0.3) 0%, transparent 65%)`
          }}
        />
      </div>

      {/* LAYER 2: FOREGROUND BRANDING & TEXT (Floats forward independently) */}
      <header 
        className="relative z-10 flex justify-between items-center transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${coords.x * -10}px, ${coords.y * -10}px, 20px)`
        }}
      >
       
    
      </header>

      {/* LAYER 3: CORE HERO HERO CALLOUT */}
      <div 
        className="relative z-10 max-w-2xl my-auto transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${coords.x * 15}px, ${coords.y * 15}px, 50px) rotateX(${coords.y * -4}deg) rotateY(${coords.x * 4}deg)`
        }}
      >
        <span className="text-amber-500 uppercase tracking-widest text-sm font-semibold mb-3 block mt-8">
          Welcome to East Africa
        </span>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight mb-6 bg-gradient-to-r from-white via-stone-200 to-stone-400 bg-clip-text text-transparent">
          Experience Authentic <br/>
          <span className="text-amber-500 font-serif italic font-normal">Ethiopian</span> Hospitality
        </h1>
        <p className="text-stone-400 text-lg mb-8 max-w-md">
          Discover traditional hand-picked luxury lodges, heritage houses, and boutique hotels across historic routes.
        </p>
        <button className="px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 font-medium rounded-xl transition-all duration-300 shadow-xl shadow-amber-950/50 transform hover:-translate-y-0.5">
          Explore Destinations
        </button>
      </div>

      {/* LAYER 4: FLOATING BOTTOM INFO TILES */}
      <div 
        className="relative z-10 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl border-t border-white/10 pt-6 transition-transform duration-500 ease-out"
        style={{
          transform: `translate3d(${coords.x * -5}px, ${coords.y * -5}px, 30px)`
        }}
      >
        <div>
          <p className="text-2xl font-bold text-amber-500">120+</p>
          <p className="text-xs text-stone-400 uppercase tracking-wider">Boutique Stays</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-amber-500">15K+</p>
          <p className="text-xs text-stone-400 uppercase tracking-wider">Happy Guests</p>
        </div>
        <div className="hidden md:block">
          <p className="text-2xl font-bold text-amber-500">98%</p>
          <p className="text-xs text-stone-400 uppercase tracking-wider">Satisfaction Rate</p>
        </div>
      </div>

    </section>
  );
}