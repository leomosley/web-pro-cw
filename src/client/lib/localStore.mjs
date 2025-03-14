export const localStore = {
  setItem(key, value) {
    try {
      const existingData = this.getItem(key);
      if (Array.isArray(existingData)) {
        existingData.push(...value);
        localStorage.setItem(key, existingData);
      } else {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error setting item in localStorage: ${error}`);
    }
  },

  getItem(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error(`Error getting item from localStorage: ${error}`);
      return null;
    }
  },

  removeItem(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item from localStorage: ${error}`);
    }
  },

  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error(`Error clearing localStorage: ${error}`);
    }
  }
};
