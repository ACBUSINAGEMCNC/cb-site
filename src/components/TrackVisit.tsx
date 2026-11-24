"use client";

import { useEffect } from "react";

export default function TrackVisit() {
  useEffect(() => {
    const payload = JSON.stringify({
      path: location.pathname + location.search,
      referrer: document.referrer || null,
    });

    try {
      const blob = new Blob([payload], { type: "application/json" });
      if (!navigator.sendBeacon || !navigator.sendBeacon("/api/track", blob)) {
        fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // tracking nunca deve quebrar a página
    }
  }, []);

  return null;
}
