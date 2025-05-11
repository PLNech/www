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
          className="masonry-grid"
          columnClassName="masonry-grid_column"
        >
          {images.map((image, i) => (
            <div
              key={i}
              className="mb-4 cursor-pointer hover:opacity-75 transition-opacity"
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative rounded-lg overflow-hidden">
                <Image
                  src={image}
                  alt={`${slug} image ${i + 1}`}
                  width={300}
                  height={300}
                  className="w-full h-auto object-cover"
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
              width={1200}
              height={800}
              className="max-w-full max-h-full object-contain"
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
