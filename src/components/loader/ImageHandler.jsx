import React, { useState, useEffect } from 'react';
import LoaderV2 from './v2';
import { getImageFromDB } from '../../lib/indexedDBUtils';
import { fetchProductImageAll } from '../../lib/store';
import Slider from '../../utilities/Slider';
import { f } from 'html2pdf.js';


const ImageHandler = ({ Id, showAll = false, image = null, onClick = null, height = 'auto', width = 'auto', className }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [images, setImages] = useState([]);

  const isOlderThanOneDay = (timestamp) => {
    const givenDate = new Date(timestamp);
    const currentDate = new Date();

    // Set time to midnight (00:00:00) to compare only the date
    givenDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    // Calculate the difference in days
    const diffInDays = (currentDate - givenDate) / (1000 * 60 * 60 * 24);

    return diffInDays > 1;
  };

  useEffect(() => {
    const fetchImagesFromDB = async () => {
      setImages([])
      if (Id) {
        try {
          let cachedImages = await getImageFromDB(Id, showAll);

          const setValidImages = (images) => {
            setImages(Array.isArray(images) && images.length ? images : [{ path: "\\assets\\images\\dummy.png" }]);
          };

          if (cachedImages) {
            setValidImages(cachedImages.images);

            if (cachedImages.timestamp && isOlderThanOneDay(cachedImages.timestamp)) {
              await fetchProductImageAll({ Id });
              cachedImages = await getImageFromDB(Id, showAll);
              setValidImages(cachedImages.images);
            }
          } else {
            await fetchProductImageAll({ Id });
            cachedImages = await getImageFromDB(Id, showAll);
            setValidImages(cachedImages?.images);
          }
        } catch (err) {
          console.error(err);
        }
      }
    };
    
    fetchImagesFromDB();
  }, [Id, showAll]);


  const handleImageLoad = () => {
    setTimeout(() => {
      setLoading(false);
    }, 200);
  };

  const handleImageError = () => {
    setError(true);
    setLoading(false);
  };



  useEffect(() => { }, [loading,images,image,Id])

  if (!Id && !image) return null;
  const imageSrc = error ? "\\assets\\images\\dummy.png" : image?.src;
  return (
    <div style={!showAll ? { position: 'relative', display: 'inline-block' } : {}}>
      {loading && !error && !showAll && (
        <div className="loading-placeholder m-auto">
          <LoaderV2 />
        </div>
      )}
      {image && image?.src ?
        <img
          key={0}
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
        :
        showAll ?
          <Slider data={images} /> :
          <img
            key={0}
            className={`zoomInEffect max-h-[350px] w-[100%] ${loading ? 'hidden' : ''} ${className}`}
            src={error ? "\\assets\\images\\dummy.png" : images?.[0]?.path || "\\assets\\images\\dummy.png"}
            alt={`Image ${images?.[0]?.name}`}
            onClick={onClick}
            style={{ cursor: 'pointer', transition: 'opacity 0.5s' }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            height={height}
            width={width}
          />
      }
    </div>
  );
};

export default ImageHandler;