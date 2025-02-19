import LZString from "lz-string";

const dbName = "ImageCacheDB";
const storeName = "images";

const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(storeName, { keyPath: "id" });
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject("Database error: " + event.target.errorCode);
    };
  });
};

const addImageToDB = async (id, imageUrls) => {
  if (!id) return Promise.reject("Invalid ID: ID must be provided");
  try {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    return new Promise((resolve, reject) => {
      try {
        const compressed = LZString.compress(JSON.stringify(imageUrls));
        store.put({ id, images: compressed, timestamp: Date.now() });
        resolve(true);
      } catch (error) {
        reject("Error compressing or storing image URLs: " + error);
      }
    });
  } catch (error) {
    console.error("Error opening database: ", error);
    return false;
  }
};

const getImageFromDB = async (id, showAll = false) => {
  if (!id) return Promise.reject("Invalid ID: ID must be provided");
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = (event) => {
      if (event.target.result?.images) {
        try {
          const decompressed = JSON.parse(LZString.decompress(event.target.result.images));
          resolve(decompressed.length > 0 ? {
            id: event.target.result.id,
            images: showAll ? decompressed : [decompressed[0]],
            timestamp: event.target.result.timestamp
          } : { id: null, images: [] });
        } catch (err) {
          reject("Error decompressing image URLs: " + err);
        }
      } else {
        resolve(null);
      }
    }

    request.onerror = (event) => {
      reject("Error retrieving image URLs: " + event.target.errorCode);
    };
  });
};

export { addImageToDB, getImageFromDB };
