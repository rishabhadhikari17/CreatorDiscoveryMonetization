import { useCallback, useMemo, useRef, useState } from "react";
import { DemoExperienceContext } from "./DemoExperienceContext.js";

export function DemoExperienceProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmation, setConfirmation] = useState(null);
  const nextToastId = useRef(1);

  const dismissToast = useCallback((id) => setToasts((current) => current.filter((toast) => toast.id !== id)), []);
  const notify = useCallback(({ title, message, tone = "success" }) => {
    const id = nextToastId.current++;
    setToasts((current) => [...current.slice(-2), { id, title, message, tone }]);
    window.setTimeout(() => dismissToast(id), 4200);
  }, [dismissToast]);
  const requestConfirmation = useCallback((options) => setConfirmation(options), []);
  const closeConfirmation = useCallback(() => setConfirmation(null), []);
  const confirmAction = useCallback(() => {
    const action = confirmation?.onConfirm;
    setConfirmation(null);
    action?.();
  }, [confirmation]);

  const value = useMemo(() => ({ toasts, confirmation, notify, dismissToast, requestConfirmation, closeConfirmation, confirmAction }), [toasts, confirmation, notify, dismissToast, requestConfirmation, closeConfirmation, confirmAction]);
  return <DemoExperienceContext.Provider value={value}>{children}</DemoExperienceContext.Provider>;
}
