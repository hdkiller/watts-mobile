import { useEffect, type ReactNode } from 'react';

import { loadThemePreference } from './themePreference';

/** Hydrate + apply stored appearance preference as early as possible. */
export function ThemePreferenceBootstrap({ children }: { children: ReactNode }) {
  useEffect(() => {
    void loadThemePreference();
  }, []);

  return children;
}
