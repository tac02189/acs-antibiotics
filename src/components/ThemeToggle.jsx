import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/theme.js";

// Lives in the brand bar, which is dark in both schemes, so it is styled once.
// The icon and the label name the theme a tap switches to.
export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === "light" ? "dark" : "light";
  const Icon = next === "light" ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className="inline-flex items-center justify-center size-11 rounded border border-rulestrong bg-card/80 hover:bg-rule/60 hover:border-accent transition-all shadow-sm active:scale-95 shrink-0"
    >
      <Icon className="size-[18px] text-accent" aria-hidden="true" />
    </button>
  );
}
