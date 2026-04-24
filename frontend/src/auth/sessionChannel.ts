const channel = new BroadcastChannel("session_channel");

export const sessionChannel = {
  logout() {
    channel.postMessage({ type: "LOGOUT" });
  },

  onLogout(callback: () => void) {
    const listener = (event: MessageEvent) => {
      if (event.data?.type === "LOGOUT") {
        callback();
      }
    };

    channel.addEventListener("message", listener);

    return () => channel.removeEventListener("message", listener);
  },

  close() {
    channel.close();
  },
};