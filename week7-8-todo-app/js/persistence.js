import { STORAGE_KEY } from './constants.js';

export const persistence = {
  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  save(todos) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    } catch {
      console.warn('Could not persist todos');
    }
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};