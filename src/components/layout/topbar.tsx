"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppSettings } from "@/components/providers/settings-provider";

function thaiDate(value: Date) {
  return new Intl.DateTimeFormat("th-TH", {
    dateStyle: "full"
  }).format(value);
}

export function Topbar() {
  const { settings } = useAppSettings();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
    <header className="mb-6 rounded-2xl border border-white/70 bg-white/75 p-4 shadow-card backdrop-blur-xl">
      <p className="text-sm text-textSecondary">{settings.topbar.greeting}, {settings.app.name}</p>
      <h2 className="text-lg font-bold">{thaiDate(now)}</h2>
      <p className="text-sm text-textSecondary">{settings.topbar.timePrefix} {time} {settings.topbar.timeSuffix}</p>
    </header>
  );
}