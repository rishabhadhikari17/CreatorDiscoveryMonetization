import { createContext, useContext } from "react";

export const DemoExperienceContext = createContext(null);

export function useDemoExperience() {
  const context = useContext(DemoExperienceContext);
  if (!context) throw new Error("useDemoExperience must be used inside DemoExperienceProvider");
  return context;
}
