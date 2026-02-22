"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

type ProductImageGalleryProps = {
  productName: string;
  images: string[];
};

const FALLBACK_PRODUCT_IMAGE = "/img/products/placeholder-product.svg";

export function ProductImageGallery({ productName, images }: ProductImageGalleryProps) {
  const normalizedImages = useMemo(() => {
    const cleaned = images
      .map((imagePath) => imagePath.trim())
      .filter((imagePath) => imagePath.length > 0);

    return cleaned.length > 0 ? cleaned : [FALLBACK_PRODUCT_IMAGE];
  }, [images]);

  const [activeIndex, setActiveIndex] = useState(0);
  const safeActiveIndex = Math.min(activeIndex, normalizedImages.length - 1);
  const activeImage = normalizedImages[safeActiveIndex] ?? normalizedImages[0];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-b from-[#f1f6ff] to-white p-3 sm:p-4">
      <div className="mx-auto w-full max-w-[300px] overflow-hidden rounded-xl border border-blue-100 bg-[#f7faff] sm:max-w-[340px] lg:max-w-[380px] xl:max-w-[420px]">
        <div className="relative aspect-[3/5]">
        <Image
          src={activeImage}
          alt={productName}
          width={1200}
          height={900}
          className="h-full w-full object-contain p-3 sm:p-4"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/45 via-transparent to-transparent"></div>
        </div>
      </div>

      {normalizedImages.length > 1 ? (
        <div className="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5">
          {normalizedImages.map((image, index) => {
            const isActive = index === safeActiveIndex;
            return (
              <button
                key={`${image}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative overflow-hidden rounded-lg border bg-white p-1 transition-all duration-200 ${
                  isActive
                    ? "border-[#4a6bfe] ring-2 ring-[#4a6bfe]/25"
                    : "border-gray-200 hover:border-[#4a6bfe]/45"
                }`}
                aria-label={`Prikazi sliku ${index + 1} za ${productName}`}
              >
                <Image
                  src={image}
                  alt={`${productName} - slika ${index + 1}`}
                  width={200}
                  height={150}
                  className="h-16 w-full object-contain p-1 sm:h-20"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
