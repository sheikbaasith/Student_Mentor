import { useColorTheme, themes, ColorTheme } from "@/hooks/useColorTheme";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeSelector() {
  const { colorTheme, setColorTheme } = useColorTheme();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {(Object.keys(themes) as ColorTheme[]).map((key) => {
        const theme = themes[key];
        const isActive = colorTheme === key;

        return (
          <button
            key={key}
            onClick={() => setColorTheme(key)}
            className={cn(
              "relative flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-all hover:shadow-md",
              isActive
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border hover:border-primary/40"
            )}
          >
            {isActive && (
              <div className="absolute top-2 right-2 rounded-full bg-primary p-0.5">
                <Check className="h-3 w-3 text-primary-foreground" />
              </div>
            )}
            <div className="flex gap-1.5">
              {theme.preview.map((color, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{theme.label}</span>
          </button>
        );
      })}
    </div>
  );
}
