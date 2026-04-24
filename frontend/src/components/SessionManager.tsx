import { useIdleTimer } from "react-idle-timer";
import { useAuth } from "../auth/useAuth";

const INACTIVITY_LIMIT = 30 * 60 * 1000;

const SessionManager = () => {
  const { logout } = useAuth();

  useIdleTimer({
    timeout: INACTIVITY_LIMIT,

    onIdle: () => {
      logout();
    },

    debounce: 500,
    events: [
      "mousemove",
      "keydown",
      "wheel",
      "mousedown",
      "touchstart",
      "visibilitychange",
    ],
  });

  return null;
};

export default SessionManager;