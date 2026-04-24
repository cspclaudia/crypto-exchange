let isIdle = false;

export const sessionState = {
  setIdle(value: boolean) {
    isIdle = value;
  },

  getIdle() {
    return isIdle;
  },
};