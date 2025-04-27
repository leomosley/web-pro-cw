export const localStore = {
  setItem(key, value) {
    try {
      let valueToStore = value;
      const existingData = this.getItem(key);

      if (Array.isArray(existingData)) {
        if (!Array.isArray(value)) {
          console.warn(
            "setItem: Appending a non-array value to an existing array.  This may lead to unexpected behavior."
          );
        }
        existingData.push(...(Array.isArray(value) ? value : [value]));
        valueToStore = JSON.stringify(existingData);

      } else {
        valueToStore = JSON.stringify(value);
      }

      localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error(`Error setting item in localStorage: ${error}`);
    }
  },

  getItem(key) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      const rawValue = localStorage.getItem(key);
      if (rawValue) {
        console.warn(
          `getItem: Could not parse value for key "${key}" as JSON. Returning raw value.`
        );
        return rawValue;
      }
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
  },
};
