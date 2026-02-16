import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type ColorTheme = "navy" | "purple" | "emerald" | "sunset" | "rose" | "ocean";

interface ColorThemeContextType {
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

const themes: Record<ColorTheme, { light: Record<string, string>; dark: Record<string, string>; label: string; preview: string[] }> = {
  navy: {
    label: "Navy",
    preview: ["#3b4f6b", "#4a6382", "#5a7799"],
    light: {
      "--primary": "216 19% 26%",
      "--primary-foreground": "210 19% 98%",
      "--secondary": "215 19% 34%",
      "--secondary-foreground": "210 40% 98%",
      "--accent": "210 40% 98%",
      "--accent-foreground": "215 16% 46%",
      "--ring": "216 19% 26%",
      "--sidebar-primary": "216 19% 26%",
      "--sidebar-primary-foreground": "210 19% 98%",
      "--sidebar-accent": "215 19% 34%",
      "--sidebar-accent-foreground": "210 40% 98%",
      "--chart-1": "217 10% 64%",
      "--chart-2": "215 20% 65%",
      "--chart-3": "215 16% 46%",
      "--chart-4": "219 8% 46%",
      "--chart-5": "215 19% 34%",
    },
    dark: {
      "--primary": "212 26% 83%",
      "--primary-foreground": "228 84% 4%",
      "--secondary": "215 19% 34%",
      "--secondary-foreground": "210 40% 98%",
      "--accent": "228 84% 4%",
      "--accent-foreground": "215 20% 65%",
      "--ring": "212 26% 83%",
      "--sidebar-primary": "212 26% 83%",
      "--sidebar-primary-foreground": "228 84% 4%",
      "--sidebar-accent": "215 20% 65%",
      "--sidebar-accent-foreground": "228 84% 4%",
      "--chart-1": "215 12% 83%",
      "--chart-2": "212 26% 83%",
      "--chart-3": "215 20% 65%",
      "--chart-4": "217 10% 64%",
      "--chart-5": "215 16% 46%",
    },
  },
  purple: {
    label: "Purple",
    preview: ["#7c3aed", "#8b5cf6", "#a78bfa"],
    light: {
      "--primary": "263 70% 58%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "263 50% 45%",
      "--secondary-foreground": "0 0% 100%",
      "--accent": "263 90% 96%",
      "--accent-foreground": "263 70% 40%",
      "--ring": "263 70% 58%",
      "--sidebar-primary": "263 70% 58%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-accent": "263 50% 45%",
      "--sidebar-accent-foreground": "0 0% 100%",
      "--chart-1": "263 40% 70%",
      "--chart-2": "263 50% 60%",
      "--chart-3": "263 60% 50%",
      "--chart-4": "283 40% 55%",
      "--chart-5": "243 50% 50%",
    },
    dark: {
      "--primary": "263 70% 70%",
      "--primary-foreground": "263 90% 8%",
      "--secondary": "263 40% 35%",
      "--secondary-foreground": "263 20% 90%",
      "--accent": "263 80% 10%",
      "--accent-foreground": "263 50% 70%",
      "--ring": "263 70% 70%",
      "--sidebar-primary": "263 70% 70%",
      "--sidebar-primary-foreground": "263 90% 8%",
      "--sidebar-accent": "263 40% 50%",
      "--sidebar-accent-foreground": "263 90% 8%",
      "--chart-1": "263 40% 80%",
      "--chart-2": "263 50% 70%",
      "--chart-3": "263 60% 60%",
      "--chart-4": "283 40% 65%",
      "--chart-5": "243 50% 55%",
    },
  },
  emerald: {
    label: "Emerald",
    preview: ["#059669", "#10b981", "#34d399"],
    light: {
      "--primary": "160 84% 30%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "160 60% 38%",
      "--secondary-foreground": "0 0% 100%",
      "--accent": "160 80% 95%",
      "--accent-foreground": "160 84% 25%",
      "--ring": "160 84% 30%",
      "--sidebar-primary": "160 84% 30%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-accent": "160 60% 38%",
      "--sidebar-accent-foreground": "0 0% 100%",
      "--chart-1": "160 40% 65%",
      "--chart-2": "160 50% 55%",
      "--chart-3": "160 60% 40%",
      "--chart-4": "140 40% 50%",
      "--chart-5": "180 50% 40%",
    },
    dark: {
      "--primary": "160 70% 55%",
      "--primary-foreground": "160 90% 5%",
      "--secondary": "160 40% 30%",
      "--secondary-foreground": "160 20% 90%",
      "--accent": "160 80% 8%",
      "--accent-foreground": "160 50% 60%",
      "--ring": "160 70% 55%",
      "--sidebar-primary": "160 70% 55%",
      "--sidebar-primary-foreground": "160 90% 5%",
      "--sidebar-accent": "160 40% 45%",
      "--sidebar-accent-foreground": "160 90% 5%",
      "--chart-1": "160 40% 75%",
      "--chart-2": "160 50% 65%",
      "--chart-3": "160 60% 50%",
      "--chart-4": "140 40% 60%",
      "--chart-5": "180 50% 50%",
    },
  },
  sunset: {
    label: "Sunset",
    preview: ["#ea580c", "#f97316", "#fb923c"],
    light: {
      "--primary": "25 95% 48%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "15 80% 42%",
      "--secondary-foreground": "0 0% 100%",
      "--accent": "30 90% 95%",
      "--accent-foreground": "25 95% 35%",
      "--ring": "25 95% 48%",
      "--sidebar-primary": "25 95% 48%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-accent": "15 80% 42%",
      "--sidebar-accent-foreground": "0 0% 100%",
      "--chart-1": "25 50% 65%",
      "--chart-2": "35 60% 55%",
      "--chart-3": "15 70% 45%",
      "--chart-4": "45 50% 50%",
      "--chart-5": "5 60% 45%",
    },
    dark: {
      "--primary": "25 90% 60%",
      "--primary-foreground": "25 95% 5%",
      "--secondary": "15 50% 32%",
      "--secondary-foreground": "25 20% 90%",
      "--accent": "25 80% 8%",
      "--accent-foreground": "25 60% 65%",
      "--ring": "25 90% 60%",
      "--sidebar-primary": "25 90% 60%",
      "--sidebar-primary-foreground": "25 95% 5%",
      "--sidebar-accent": "15 50% 45%",
      "--sidebar-accent-foreground": "25 95% 5%",
      "--chart-1": "25 50% 75%",
      "--chart-2": "35 60% 65%",
      "--chart-3": "15 70% 55%",
      "--chart-4": "45 50% 60%",
      "--chart-5": "5 60% 55%",
    },
  },
  rose: {
    label: "Rose",
    preview: ["#e11d48", "#f43f5e", "#fb7185"],
    light: {
      "--primary": "347 77% 50%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "347 60% 42%",
      "--secondary-foreground": "0 0% 100%",
      "--accent": "347 90% 96%",
      "--accent-foreground": "347 77% 38%",
      "--ring": "347 77% 50%",
      "--sidebar-primary": "347 77% 50%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-accent": "347 60% 42%",
      "--sidebar-accent-foreground": "0 0% 100%",
      "--chart-1": "347 40% 70%",
      "--chart-2": "347 50% 60%",
      "--chart-3": "347 60% 50%",
      "--chart-4": "327 45% 55%",
      "--chart-5": "7 50% 50%",
    },
    dark: {
      "--primary": "347 70% 65%",
      "--primary-foreground": "347 90% 5%",
      "--secondary": "347 40% 32%",
      "--secondary-foreground": "347 20% 90%",
      "--accent": "347 80% 8%",
      "--accent-foreground": "347 50% 65%",
      "--ring": "347 70% 65%",
      "--sidebar-primary": "347 70% 65%",
      "--sidebar-primary-foreground": "347 90% 5%",
      "--sidebar-accent": "347 40% 45%",
      "--sidebar-accent-foreground": "347 90% 5%",
      "--chart-1": "347 40% 80%",
      "--chart-2": "347 50% 70%",
      "--chart-3": "347 60% 55%",
      "--chart-4": "327 45% 65%",
      "--chart-5": "7 50% 55%",
    },
  },
  ocean: {
    label: "Ocean",
    preview: ["#0284c7", "#0ea5e9", "#38bdf8"],
    light: {
      "--primary": "199 89% 40%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "199 70% 33%",
      "--secondary-foreground": "0 0% 100%",
      "--accent": "199 90% 95%",
      "--accent-foreground": "199 89% 30%",
      "--ring": "199 89% 40%",
      "--sidebar-primary": "199 89% 40%",
      "--sidebar-primary-foreground": "0 0% 100%",
      "--sidebar-accent": "199 70% 33%",
      "--sidebar-accent-foreground": "0 0% 100%",
      "--chart-1": "199 45% 65%",
      "--chart-2": "199 55% 55%",
      "--chart-3": "199 65% 42%",
      "--chart-4": "179 50% 45%",
      "--chart-5": "219 55% 45%",
    },
    dark: {
      "--primary": "199 80% 60%",
      "--primary-foreground": "199 95% 5%",
      "--secondary": "199 45% 30%",
      "--secondary-foreground": "199 20% 90%",
      "--accent": "199 80% 8%",
      "--accent-foreground": "199 55% 65%",
      "--ring": "199 80% 60%",
      "--sidebar-primary": "199 80% 60%",
      "--sidebar-primary-foreground": "199 95% 5%",
      "--sidebar-accent": "199 45% 45%",
      "--sidebar-accent-foreground": "199 95% 5%",
      "--chart-1": "199 45% 75%",
      "--chart-2": "199 55% 65%",
      "--chart-3": "199 65% 52%",
      "--chart-4": "179 50% 55%",
      "--chart-5": "219 55% 55%",
    },
  },
};

export function ColorThemeProvider({ children }: { children: ReactNode }) {
  const [colorTheme, setColorTheme] = useState<ColorTheme>(() => {
    return (localStorage.getItem("color-theme") as ColorTheme) || "navy";
  });

  useEffect(() => {
    localStorage.setItem("color-theme", colorTheme);
    applyTheme(colorTheme);
  }, [colorTheme]);

  // Re-apply when dark/light mode changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      applyTheme(colorTheme);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, [colorTheme]);

  return (
    <ColorThemeContext.Provider value={{ colorTheme, setColorTheme }}>
      {children}
    </ColorThemeContext.Provider>
  );
}

function applyTheme(theme: ColorTheme) {
  const isDark = document.documentElement.classList.contains("dark");
  const vars = isDark ? themes[theme].dark : themes[theme].light;
  const root = document.documentElement;
  Object.entries(vars).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (!context) throw new Error("useColorTheme must be used within ColorThemeProvider");
  return context;
}

export { themes };
