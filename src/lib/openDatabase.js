import { GetAuthData } from "./store";

const openDatabase = async () => {
    let user = await GetAuthData();
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(user?.Sales_Rep__c||'myDatabase', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            db.createObjectStore('dataStore', { keyPath: 'pageKey' });
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
};
export default openDatabase