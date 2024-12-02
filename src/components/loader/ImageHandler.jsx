import React, { useState } from 'react';
import LoaderV2 from './v2';

const ImageHandler = ({ image, onClick = null,height='auto',width='auto' }) => {
  const [loading, setLoading] = useState(true); // State to track loading
  const [error, setError] = useState(false); // State to track image loading error

  const handleImageLoad = () => {
    setLoading(false); // Set loading to false when image loads
  };

  const handleImageError = () => {
    setError(true); // Set error to true if image fails to load
    setLoading(false); // Also stop loading
  };

  // Determine the image source: use dummy image if there's an error
  const imageSrc = error ? "\\assets\\images\\dummy.png" : image?.src;

  if(!image || !image?.src) return null;

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Show a loading spinner or placeholder while the image is loading */}
      {loading && !error && (
        <div className="loading-placeholder m-auto">
          {/* You can customize this placeholder */}
          <LoaderV2 />
        </div>
      )}

      <img
        className={`zoomInEffect max-h-[350px] w-[100%] img-fluid ${loading ? 'hidden' : ''}`} // Hide image while loading
        src={imageSrc}
        alt={image?.alt??"...."}
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