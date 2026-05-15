"use client";

import { useEffect, useMemo, useState } from "react";
import { Moon, SunMedium } from "lucide-react";
import { useAppSettings } from "@/components/providers/settings-provider";

function thaiDate(value: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "full"
  }).format(value);
}

export function Topbar() {
  const { settings } = useAppSettings();
  const [now, setNow] = useState(new Date());
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("leo-theme");
    const nextTheme =
      savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    window.localStorage.setItem("leo-theme", nextTheme);
  };

  const time = useMemo(
    () =>
      new Intl.DateTimeFormat("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).format(now),
    [now]
  );

  return (
    <header className="mb-6 rounded-2xl border border-borderSoft bg-surface/85 p-4 shadow-card backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-textSecondary">{settings.topbar.greeting}, {settings.app.name}</p>
          <h2 className="text-lg font-bold">{thaiDate(now)}</h2>
          <p className="text-sm text-textSecondary">{settings.topbar.timePrefix} {time} {settings.topbar.timeSuffix}</p>
        </div>
        <button
          type="button"
          onClick={toggleTheme}
          className="inline-flex items-center gap-2 rounded-xl border border-borderSoft bg-surface px-3 py-2 text-xs font-semibold text-textPrimary hover:bg-surface2"
          aria-label="Toggle color theme"
          title="สลับธีมสว่าง/มืด"
        >
          {theme === "dark" ? <SunMedium size={14} /> : <Moon size={14} />}
          {theme === "dark" ? "Light" : "Dark"}
        </button>
      </div>
    </header>
  );
}