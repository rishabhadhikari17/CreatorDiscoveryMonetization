import { createContext, useContext } from "react";

export const DealStateContext = createContext(null);

export function useDealState() {
  const context = useContext(DealStateContext);
  if (!context) throw new Error("useDealState must be used inside DealStateProvider");
  return context;
}
