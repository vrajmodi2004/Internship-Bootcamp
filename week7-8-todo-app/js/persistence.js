import { STORAGE_KEY } from './constants.js';

let db = null;

// Initialize IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('TaskflowDB', 1);

    request.onerror = () => reject(request.error);
    
    request.onupgradeneeded = (event) => {
      const database = event.target.result;
      if (!database.objectStoreNames.contains('todos')) {
        database.createObjectStore('todos');
      }
    };

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };
  });
};

export const persistence = {
  async load() {
    try {
      if (!db) await initDB();
      
      return new Promise((resolve) => {
        const transaction = db.transaction('todos', 'readonly');
        const store = transaction.objectStore('todos');
        const request = store.get(STORAGE_KEY);

        request.onsuccess = () => {
          const data = request.result;
          resolve(Array.isArray(data) ? data : []);
        };

        request.onerror = () => resolve([]);
      });
    } catch {
      return [];
    }
  },

  async save(todos) {
    try {
      if (!db) await initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('todos', 'readwrite');
        const store = transaction.objectStore('todos');
        const request = store.put(todos, STORAGE_KEY);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('Could not persist todos:', error);
    }
  },

  async clear() {
    try {
      if (!db) await initDB();
      
      return new Promise((resolve, reject) => {
        const transaction = db.transaction('todos', 'readwrite');
        const store = transaction.objectStore('todos');
        const request = store.delete(STORAGE_KEY);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (error) {
      console.warn('Could not clear todos:', error);
    }
  },
};