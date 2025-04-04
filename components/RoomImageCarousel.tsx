'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface RoomImageCarouselProps {
  images: string[];
  roomName: string;
}

export default function RoomImageCarousel({ images, roomName }: RoomImageCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Don't render carousel if no images
  if (!images || images.length === 0) {
    return (
      <div className="relative h-48 bg-muted/10 flex items-center justify-center">
        <span className="text-muted text-sm">No images available</span>
      </div>
    );
  }

  // If only one image, render it without controls
  if (images.length === 1) {
    return (
      <div className="relative h-48 bg-muted/10">
        <img
          src={images[0]}
          alt={`${roomName} view`}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const nextImage = () => {
    setActiveIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const prevImage = () => {
    setActiveIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  return (
    <div className="relative h-48 bg-muted/10 group">
      <img
        src={images[activeIndex]}
        alt={`${roomName} view ${activeIndex + 1}`}
        className="w-full h-full object-cover transition-opacity duration-300"
      />
      
      {/* Left arrow */}
      <button 
        onClick={prevImage}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/40"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      
      {/* Right arrow */}
      <button 
        onClick={nextImage}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/40"
        aria-label="Next image"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
      
      {/* Image counter */}
      <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
        {activeIndex + 1} / {images.length}
      </div>
    </div>
  );
}