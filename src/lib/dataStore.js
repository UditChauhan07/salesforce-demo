import LZString from 'lz-string';

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
            // Check if there's already compressed data in localStorage
            const cachedData = localStorage.getItem(pageKey);

            let parsedData = null;
            if (cachedData) {
                try {
                    // Decompress the data before parsing it
                    const decompressedData = LZString.decompress(cachedData);
                    parsedData = JSON.parse(decompressedData);
                } catch (error) {
                    console.error(error);
                }
            }

            // If cached data exists, return it immediately
            if (parsedData) {
                // Start background update for fresh data
                this.update(pageKey, fetchData);
                return parsedData;
            }

            // No cached data: fetch fresh data immediately, store it, and return it
            const data = await fetchData?.();
            if (data) {
                // Compress and store the data in localStorage
                const compressedData = LZString.compress(JSON.stringify(data));
                localStorage.setItem(pageKey, compressedData);
                this.notify(pageKey, data); // Notify listeners
                return data;
            }
        } catch (error) {
            console.error('Error in getPageData:', error);
            return null;
        }
    },

    // Retrieve data from localStorage
    retrieve(pageKey) {
        try {
            const cachedData = localStorage.getItem(pageKey);
            if (cachedData) {
                // Decompress the data before parsing it
                const decompressedData = LZString.decompress(cachedData);
                return decompressedData ? JSON.parse(decompressedData) : null;
            }
            return null;
        } catch (error) {
            console.error('Error retrieving data:', error);
            return null;
        }
    },

    // Update data in cache and localStorage in the background
    async update(pageKey, fetchData) {
        try {
            const data = await fetchData?.(); // Fetch new data
            if (data) {
                // Compress and store the data in localStorage
                const compressedData = LZString.compress(JSON.stringify(data));
                localStorage.setItem(pageKey, compressedData);
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
                // Compress and store the data in localStorage
                const compressedData = LZString.compress(JSON.stringify(data));
                localStorage.setItem(pageKey, compressedData);
                this.notify(pageKey, data); // Notify listeners
                return data;
            }
        } catch (error) {
            console.error('Error updating data:', error);
        }
    },

    // Clear specific page data
    clear(pageKey) {
        try {
            localStorage.removeItem(pageKey);
            this.notify(pageKey, null); // Notify listeners of deletion
        } catch (error) {
            console.error('Error clearing data:', error);
        }
    },

    // Clear all stored data
    clearAll() {
        try {
            localStorage.clear();
            Object.keys(this.listeners).forEach((pageKey) => this.notify(pageKey, null)); // Notify all listeners
        } catch (error) {
            console.error('Error clearing all data:', error);
        }
    },
};

export default dataStore;