import LZString from 'lz-string';
import openDatabase from './openDatabase';

const dataStore = {
    listeners: {}, // Store listeners for each pageKey

    // Subscribe to updates for a specific pageKey
    subscribe(pageKey, callback) {
        if (!this.listeners[pageKey]) {
            this.listeners[pageKey] = [];
        }
        this.listeners[pageKey].push(callback);
    },

    // Unsubscribe a specific listener
    unsubscribe(pageKey, callback) {
        if (this.listeners[pageKey]) {
            this.listeners[pageKey] = this.listeners[pageKey].filter((cb) => cb !== callback);
        }
    },

    // Notify all listeners of updates for a specific pageKey
    notify(pageKey, data) {
        if (this.listeners[pageKey]) {
            this.listeners[pageKey].forEach((callback) => callback(data));
        }
    },

    // Method to store or update data based on page
    async getPageData(pageKey, fetchData) {
        try {
            const db = await openDatabase();
            const transaction = db.transaction('dataStore', 'readonly');
            const store = transaction.objectStore('dataStore');
            const request = store.get(pageKey);

            return new Promise((resolve, reject) => {
                request.onsuccess = async (event) => {
                    const result = event.target.result;
                    let parsedData = null;

                    if (result) {
                        try {
                            // Decompress the data before parsing it
                            const decompressedData = LZString.decompress(result.data);
                            parsedData = JSON.parse(decompressedData);
                        } catch (error) {
                            console.error(error);
                        }
                    }

                    // If cached data exists, return it immediately
                    if (parsedData) {
                        // Start background update for fresh data
                        this.update(pageKey, fetchData);
                        resolve(parsedData);
                    } else {
                        // No cached data: fetch fresh data immediately, store it, and return it
                        const data = await fetchData?.();
                        if (data) {
                            // Compress and store the data in IndexedDB
                            const compressedData = LZString.compress(JSON.stringify(data));
                            const transaction = db.transaction('dataStore', 'readwrite');
                            const store = transaction.objectStore('dataStore');
                            store.put({ pageKey, data: compressedData });

                            this.notify(pageKey, data); // Notify listeners
                            resolve(data);
                        } else {
                            resolve(null);
                        }
                    }
                };

                request.onerror = (event) => {
                    console.error('Error retrieving data:', event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            console.error('Error in getPageData:', error);
            return null;
        }
    },

    // Retrieve data from IndexedDB
    async retrieve(pageKey) {
        try {
            const db = await openDatabase();
            const transaction = db.transaction('dataStore', 'readonly');
            const store = transaction.objectStore('dataStore');
            const request = store.get(pageKey);

            return new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    const result = event.target.result;
                    if (result) {
                        // Decompress the data before parsing it
                        const decompressedData = LZString.decompress(result.data);
                        resolve(decompressedData ? JSON.parse(decompressedData) : null);
                    } else {
                        resolve(null);
                    }
                };

                request.onerror = (event) => {
                    console.error('Error retrieving data:', event.target.error);
                    reject(event.target.error);
                };
            });
        } catch (error) {
            console.error('Error retrieving data:', error);
            return null;
        }
    },

    // Update data in cache and IndexedDB in the background
    async update(pageKey, fetchData) {
        try {
            const data = await fetchData?.(); // Fetch new data
            if (data) {
                // Compress and store the data in IndexedDB
                const compressedData = LZString.compress(JSON.stringify(data));
                const db = await openDatabase();
                const transaction = db.transaction('dataStore', 'readwrite');
                const store = transaction.objectStore('dataStore');
                store.put({ pageKey, data: compressedData });

                this.notify(pageKey, data); // Notify listeners
                return data;
            }
        } catch (error) {
            console.error('Error updating data:', error);
        }
    },

    // Directly update data without fetching
    async updateData(pageKey, data) {
        try {
            if (data) {
                // Compress and store the data in IndexedDB
                const compressedData = LZString.compress(JSON.stringify(data));
                const db = await openDatabase();
                const transaction = db.transaction('dataStore', 'readwrite');
                const store = transaction.objectStore('dataStore');
                store.put({ pageKey, data: compressedData });

                this.notify(pageKey, data); // Notify listeners
                return data;
            }
        } catch (error) {
            console.error('Error updating data:', error);
        }
    },

    // Clear specific page data
    async clear(pageKey) {
        try {
            const db = await openDatabase();
            const transaction = db.transaction('dataStore', 'readwrite');
            const store = transaction.objectStore('dataStore');
            store.delete(pageKey);
            this.notify(pageKey, null); // Notify listeners of deletion
        } catch (error) {
            console.error('Error clearing data:', error);
        }
    },
    async clearAll() {
        return new Promise((resolve, reject) => {
            resolve(true);
        });
    },
    // Clear all stored data
    async clearAllDiscart() {
        try {
            const db = await openDatabase();
            const transaction = db.transaction('dataStore', 'readwrite');
            const store = transaction.objectStore('dataStore');

            // Return a promise that resolves when the clear operation is complete
            return new Promise((resolve, reject) => {
                const request = store.clear();

                request.onsuccess = (event) => {
                    console.log("All data cleared successfully.", { event });
                    Object.keys(this.listeners).forEach((pageKey) => this.notify(pageKey, null)); // Notify all listeners
                    resolve(true); // Resolve the promise on success
                };
                request.onerror = (event) => {
                    console.error('Error clearing all data:', event.target.error);
                    reject(event.target.error); // Reject the promise on error
                };
            });
        } catch (error) {
            console.error('Error clearing all data:', error);
            throw error; // Re-throw the error to be caught in the calling function
        }
    }
}

export default dataStore;