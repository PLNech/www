import { useState } from 'react';
import Masonry from 'react-masonry-css';
import styles from '@/styles/parvagues.module.css';

export default function ImageGallery({ images }) {
    const [selectedImage, setSelectedImage] = useState(null);

    const breakpointColumnsObj = {
        default: 3,
        1100: 3,
        700: 2,
        500: 1
    };

    if (!images || images.length === 0) return null;

    return (
        <>
            <Masonry
                breakpointCols={breakpointColumnsObj}
                className={styles.galleryGrid}
                columnClassName={styles.galleryGridColumn}
            >
                {images.map((image, index) => (
                    <div
                        key={index}
                        className={`${styles.galleryCard} mb-4 cursor-pointer overflow-hidden rounded-lg border border-transparent hover:border-purple-500/50`}
                        onClick={() => setSelectedImage(image)}
                    >
                        <img
                            src={image}
                            alt={`Gallery image ${index + 1}`}
                            className="w-full h-auto block"
                            loading="lazy"
                        />
                    </div>
                ))}
            </Masonry>

            {selectedImage && (
                <div
                    className={styles.modalOverlay}
                    onClick={() => setSelectedImage(null)}
                >
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <button
                            className={styles.modalCloseButton}
                            onClick={() => setSelectedImage(null)}
                        >
                            &times;
                        </button>
                        <img
                            src={selectedImage}
                            alt="Full size"
                            className="max-w-full max-h-[90vh] object-contain"
                        />
                    </div>
                </div>
            )}
        </>
    );
}
