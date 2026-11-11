"use client";

import { useState } from "react";
import Image from "next/image";
import GearIcon from "@/components/GearIcon";

export type GalleryImage = {
  url: string;
  isPrimary: boolean;
  sortOrder: number;
};

export default function ProductGallery({
  images,
  alt,
}: {
  images: GalleryImage[];
  alt: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex];

  return (
    <div>
      <div className="relative aspect-square overflow-hidden bg-[radial-gradient(circle_at_50%_60%,#2a2f36,#14171b_70%)]">
        {activeImage ? (
          <Image
            src={activeImage.url}
            alt={alt}
            fill
            priority
            sizes="(max-width: 1023px) 100vw, 52vw"
            className="object-contain p-6 drop-shadow-2xl"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-steel/50">
            <GearIcon className="h-16 w-16" />
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              aria-label={`Mostrar imagem ${index + 1} de ${images.length}`}
              aria-pressed={activeIndex === index}
              onClick={() => setActiveIndex(index)}
              className={`relative aspect-square overflow-hidden border bg-surface transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                activeIndex === index
                  ? "border-accent"
                  : "border-line hover:border-steel/50"
              }`}
            >
              <Image
                src={image.url}
                alt=""
                fill
                sizes="(max-width: 639px) 22vw, 12vw"
                className="object-contain p-2"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
