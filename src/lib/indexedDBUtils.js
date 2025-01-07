// indexedDBUtils.js
const dbName = "ImageCacheDB";
const storeName = "images";

const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(storeName, { keyPath: "src" });
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject("Database error: " + event.target.errorCode);
    };
  });
};

const addImageToDB = async (src) => {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);
  store.put({ src });
};

const getImageFromDB = async (src) => {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(src);

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject("Error retrieving image: " + event.target.errorCode);
    };
  });
};

export { addImageToDB, getImageFromDB };