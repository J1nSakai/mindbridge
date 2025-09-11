import React from "react";
import { useTheme } from "../../contexts/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { Button } from "./button";

const ThemeToggle = ({ className = "" }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <Button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center
        h-6 w-6 md:w-12 md:h-12 rounded-full
        bg-secondary-background border-2 border-border
        hover:bg-background transition-all duration-300
        focus:outline-none
        group overflow-hidden
        ${className}
      `}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Sun Icon */}
      <Sun
        className={`
          absolute w-5 h-5 text-yellow-500
          transition-all duration-500 ease-in-out
          ${
            isDark
              ? "opacity-0 rotate-90 scale-0"
              : "opacity-100 rotate-0 scale-100"
          }
        `}
      />

      {/* Moon Icon */}
      <Moon
        className={`
          absolute w-5 h-5 text-blue-400
          transition-all duration-500 ease-in-out
          ${
            isDark
              ? "opacity-100 rotate-0 scale-100"
              : "opacity-0 -rotate-90 scale-0"
          }
        `}
      />

      {/* Ripple effect on click */}
      <span
        className="
        absolute inset-0 rounded-full
        bg-main opacity-0 scale-0
        group-active:opacity-20 group-active:scale-100
        transition-all duration-200
      "
      />
    </Button>
  );
};

export default ThemeToggle;
