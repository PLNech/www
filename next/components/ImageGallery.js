// next/components/ImageGallery.js
import { useState } from 'react';
import Image from 'next/image';
import Masonry from 'react-masonry-css';

export default function ImageGallery({ images, slug }) {
  const [selectedImage, setSelectedImage] = useState(null);
  
  const breakpointColumns = {
    default: 3,
    768: 2,
    480: 1
  };
  
  return (
    <>
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 text-purple-400">Galerie</h3>
        <Masonry
          breakpointCols={breakpointColumns}
          className="masonry-grid" // Ensure this class or its child provides relative positioning for 'fill'
          columnClassName="masonry-grid_column"
        >
          {images.map((imageSrc, i) => (
            <div
              key={i}
              className="mb-4 cursor-pointer hover:opacity-75 transition-opacity"
              onClick={() => setSelectedImage(imageSrc)}
            >
              {/* Ensure this div is the relatively positioned parent for fill */}
              <div className="relative aspect-square rounded-lg overflow-hidden"> {/* Tailwind's aspect-square utility */}
                <Image
                  src={imageSrc}
                  alt={`${slug} image ${i + 1}`}
                  fill
                  className="object-cover" // object-cover will fill the square, cropping if necessary
                />
              </div>
            </div>
          ))}
        </Masonry>
      </div>
      
      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-zoom-out"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <Image
              src={selectedImage}
              alt="Selected image"
              width={1200} // These are for the lightbox, not the gallery thumbs
              height={800} // These define the max dimensions and aspect ratio for the lightbox image
              className="max-w-full max-h-full object-contain" // object-contain is good for lightbox
            />
            <button
              className="absolute top-4 right-4 text-white text-2xl hover:text-purple-400 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
}