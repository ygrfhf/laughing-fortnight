import { createContext, useContext, type ReactNode } from "react";

/**
 * Dyslexia-friendly font (OpenDyslexic). Off by default; for now only the dev toolbar sets it.
 * Kept in memory only (shared devices), so it is never written to the device.
 */
const DyslexiaFontContext = createContext(false);

interface FontSettingProviderProps {
  dyslexiaFont: boolean;
  children: ReactNode;
}

export function FontSettingProvider({ dyslexiaFont, children }: FontSettingProviderProps) {
  return <DyslexiaFontContext.Provider value={dyslexiaFont}>{children}</DyslexiaFontContext.Provider>;
}

export function useDyslexiaFont(): boolean {
  return useContext(DyslexiaFontContext);
}
