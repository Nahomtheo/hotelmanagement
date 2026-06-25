"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";

type RoomImage = {
  url: string;
  publicId: string;
};

type RoomImageCardProps = {
  images: RoomImage[];
  title?: string;
  subtitle?: string;
};

export default function RoomImageCard({
  images,
  title = "",
  subtitle = "MW Hotel",
}: RoomImageCardProps) {
  const [current, setCurrent] = useState(0);

  if (!images?.length) return null;

  const nextImage = () => {
    setCurrent((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrent((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <div className="group relative h-full w-full overflow-hidden rounded-3xl bg-black shadow-xl">

      {/* IMAGE */}
      <div className="relative h-full w-full aspect-[4/3]">
        <Image
          src={images[current].url}
          alt={title}
          fill
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* premium gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      </div>

      {/* IMAGE COUNTER */}
      <div className="absolute top-4 right-4 flex items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 text-white backdrop-blur-md">
        <Images size={14} />
        <span className="text-xs font-medium">
          {current + 1}/{images.length}
        </span>
      </div>

      {/* NAVIGATION */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            aria-label="Previous image"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 hover:bg-white/25"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={nextImage}
            aria-label="Next image"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white opacity-0 backdrop-blur-md transition group-hover:opacity-100 hover:bg-white/25"
          >
            <ChevronRight size={18} />
          </button>
        </>
      )}

      {/* DOT INDICATORS (luxury touch) */}
      {images.length > 1 && (
        <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 gap-1">
          {images.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? "w-6 bg-white" : "w-2 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}

      {/* TEXT OVERLAY */}
      <div className="absolute bottom-4 left-4 text-white">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/70">
          {subtitle}
        </p>
        <h3 className="text-xl font-semibold drop-shadow-lg">
          {title}
        </h3>
      </div>
    </div>
  );
}