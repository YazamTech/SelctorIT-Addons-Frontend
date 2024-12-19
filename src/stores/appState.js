import { defineStore } from 'pinia';

export const useAppStateStore = defineStore("appState", {
  state: () => ({
    isLoading: false,
  }),
  actions: {
    setIsLoading(val) {
      this.isLoading = val;
    },
  },
  getters: {
    doubleCount: (state) => state.counter * 2,
  },
});
