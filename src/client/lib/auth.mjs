import { localStore } from './localStore.mjs';

const USER_STORE_KEY = 'user';

export const userStore = {
  get() {
    return localStore.getItem(USER_STORE_KEY) ?? null;
  },

  watch(callback) {
    const handler = (event) => {
      if (event.detail.key === USER_STORAGE_KEY) {
        callback(event.detail.newValue);
      }
    };
    localStore.addEventListener('localStoreChange', handler);
    return () => {
      localStore.removeEventListener('localStoreChange', handler);
    };
  },

  set(value) {
    localStore.setItem(USER_STORAGE_KEY, value);
  }
};