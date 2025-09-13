// next/components/ImageGallery.js
import { useState, useEffect } from 'react'; // Added useEffect
import Image from 'next/image';
import Masonry from 'react-masonry-css';
import styles from '@/styles/parvagues.module.css'; // Import css modules

export default function ImageGallery({ images, slug }) {
  const [selectedImage, setSelectedImage] = useState(null);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };
    if (selectedImage) {
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, [selectedImage]);

  const breakpointColumns = {
    default: 4, // Changed to 4 for a denser grid
    1024: 3,
    768: 2,
    480: 1,
  };

  const isPng = (src) => typeof src === 'string' && src.toLowerCase().endsWith('.png');

  return (
    <>
      <div className="mt-8">
        <h3 className="text-2xl font-bold mb-6 text-purple-300 text-center">Galerie Photos</h3>
        <Masonry
          breakpointCols={breakpointColumns}
          className={styles.galleryGrid} // Use CSS module for masonry grid
          columnClassName={styles.galleryGridColumn}
        >
          {images.map((imageSrc, i) => (
            <div
              key={i}
              className={`${styles.galleryCard} mb-4 cursor-pointer group`}
              onClick={() => setSelectedImage(imageSrc)}
            >
              <div className={`relative aspect-square rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow duration-300 ${isPng(imageSrc) ? styles.pngBackground : 'bg-gray-800'}`}>
                <Image
                  src={imageSrc}
                  alt={`${slug} image ${i + 1}`}
                  fill
                  className={`object-cover group-hover:scale-105 transition-transform duration-300`}
                />
              </div>
            </div>
          ))}
        </Masonry>
      </div>

      {/* Modal */}
      {selectedImage && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className={`${styles.modalContent} ${isPng(selectedImage) ? styles.pngBackgroundModal : 'bg-gray-900'}`}
            onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
          >
            <Image
              src={selectedImage}
              alt="Selected image"
              width={1600} 
              height={1200}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <button
              className={styles.modalCloseButton}
              onClick={() => setSelectedImage(null)}
            >
              &times; {/* Using HTML entity for '×' for better rendering */}
            </button>
          </div>
        </div>
      )}
    </>
  );
}