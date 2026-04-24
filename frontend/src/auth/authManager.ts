import { sessionChannel } from "./sessionChannel";

export const authManager = {
  forceLogout() {
    sessionChannel.logout();
  },
};