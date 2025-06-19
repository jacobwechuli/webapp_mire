"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // On mount, check localStorage or system preference
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleDark = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    if (newDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <button
      className="flex items-center gap-2 px-2 py-1 rounded focus:outline-none focus:ring"
      onClick={toggleDark}
      aria-label="Toggle dark mode"
      type="button"
    >
      <Sun className={`h-5 w-5 transition ${isDark ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`} />
      <Moon className={`h-5 w-5 transition ${isDark ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />
      <Switch checked={isDark} onCheckedChange={toggleDark} />
    </button>
  );
} 