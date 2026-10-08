import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/theme.js";

// Lives in the brand bar, outlined in gold like the PDF button beside it. The
// icon and the label name the theme a tap switches to.
export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  const Icon = next === "light" ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className="inline-flex items-center justify-center size-11 rounded-md border border-bar-rule hover:border-gold text-gold hover:text-bar-text transition-colors shrink-0"
    >
      <Icon className="size-[18px]" aria-hidden="true" />
    </button>
  );
}
