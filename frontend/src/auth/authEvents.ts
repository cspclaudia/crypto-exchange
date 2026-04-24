export const authEvents = {
  onLogout: (() => {}) as () => void,

  setLogoutHandler(fn: () => void) {
    this.onLogout = fn;
  },

  logout() {
    this.onLogout();
  },
};