const eventTarget = new EventTarget();

export const localStore = {
  setItem(key, value) {
    try {
      if (value === null) {
        this.removeItem(key);
        return;
      }

      const oldValue = this.getItem(key);
      let valueToStore;

      if (Array.isArray(oldValue)) {
        if (!Array.isArray(value)) {
          console.warn(
            "setItem: Appending a non-array value to an existing array. This may lead to unexpected behavior."
          );
        }
        const newData = [...oldValue, ...(Array.isArray(value) ? value : [value])];
        valueToStore = JSON.stringify(newData);
      } else {
        valueToStore = JSON.stringify(value);
      }

      localStorage.setItem(key, valueToStore);

      const newValue = this.getItem(key);

      const event = new CustomEvent('localStoreChange', {
        detail: {
          key: key,
          newValue: newValue,
          oldValue: oldValue
        }
      });
      eventTarget.dispatchEvent(event);

    } catch (error) {
      console.error(`Error setting item in localStorage for key "${key}": ${error}`);
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
      const oldValue = this.getItem(key);
      localStorage.removeItem(key);

      const event = new CustomEvent('localStoreChange', {
        detail: {
          key: key,
          newValue: null,
          oldValue: oldValue
        }
      });
      eventTarget.dispatchEvent(event);

    } catch (error) {
      console.error(`Error removing item from localStorage for key "${key}": ${error}`);
    }
  },

  clear() {
    try {
      localStorage.clear();
    } catch (error) {
      console.error(`Error clearing localStorage: ${error}`);
    }
  },

  addEventListener(type, listener) {
    eventTarget.addEventListener(type, listener);
  },

  removeEventListener(type, listener) {
    eventTarget.removeEventListener(type, listener);
  }
};

window.addEventListener('storage', (event) => {
  if (event.storageArea === localStorage) {
    const oldValueParsed = event.oldValue ? JSON.parse(event.oldValue) : null;
    const newValueParsed = localStore.getItem(event.key);


    const customEvent = new CustomEvent('localStoreChange', {
      detail: {
        key: event.key,
        newValue: newValueParsed,
        oldValue: oldValueParsed
      }
    });
    if (event.key !== null) {
      eventTarget.dispatchEvent(customEvent);
    }
  }
});
