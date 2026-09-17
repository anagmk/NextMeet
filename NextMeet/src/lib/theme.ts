export type AppTheme = "light" | "dark" | "system";

const themeChangedEvent = "nextmeet-theme-changed";

export function getThemePreference(): AppTheme {
  try {
    const settings = JSON.parse(localStorage.getItem("nextmeet-settings") || "{}");
    const theme = settings?.appearance?.theme;
    return theme === "light" || theme === "dark" || theme === "system" ? theme : "system";
  } catch {
    return "system";
  }
}

export function setThemePreference(theme: AppTheme) {
  try {
    const settings = JSON.parse(localStorage.getItem("nextmeet-settings") || "{}");
    localStorage.setItem("nextmeet-settings", JSON.stringify({
      ...settings,
      appearance: { ...settings.appearance, theme },
    }));
  } catch {
    localStorage.setItem("nextmeet-settings", JSON.stringify({ appearance: { theme } }));
  }
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent<AppTheme>(themeChangedEvent, { detail: theme }));
}

export function onThemePreferenceChange(handler: (theme: AppTheme) => void) {
  const listener = (event: Event) => handler((event as CustomEvent<AppTheme>).detail);
  window.addEventListener(themeChangedEvent, listener);
  return () => window.removeEventListener(themeChangedEvent, listener);
}

export function resolveTheme(theme: AppTheme) {
  if (theme !== "system") return theme;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme: AppTheme) {
  const resolvedTheme = resolveTheme(theme);
  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.style.colorScheme = resolvedTheme;
}
