import React, { useState, useEffect } from 'react';
import LoaderV2 from './v2';
import { addImageToDB, getImageFromDB } from '../../lib/indexedDBUtils';

const ImageHandler = ({ image, onClick = null, height = 'auto', width = 'auto', className }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchImageFromDB = async () => {
      if (image && image.src) {
        try {
          const cachedImage = await getImageFromDB(image.src);
          if (cachedImage) {
            setLoading(false); // If the image is cached, stop loading
          }
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchImageFromDB();
  }, [image]);

  const handleImageLoad = async () => {
    setLoading(false);
    if (image && image.src) {
      await addImageToDB(image.src); // Cache the image in IndexedDB when it loads successfully
    }
  };

  const handleImageError = () => {
    setError(true);
    setLoading(false);
  };

  const imageSrc = error ? "\\assets\\images\\dummy.png" : image?.src;

  if (!image || !image?.src) return null;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {loading && !error && (
        <div className="loading-placeholder m-auto">
          <LoaderV2 />
        </div>
      )}

      <img
        className={`zoomInEffect max-h-[350px] w-[100%] ${loading ? 'hidden' : ''} ${className}`}
        src={imageSrc}
        alt={image?.alt ?? "...."}
        onClick={onClick}
        style={{ cursor: 'pointer', transition: 'opacity 0.5s' }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        height={height}
        width={width}
      />
    </div>
  );
};

export default ImageHandler;