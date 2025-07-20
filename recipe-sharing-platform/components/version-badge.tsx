"use client";
import { useEffect, useState } from "react";

export default function VersionBadge() {
  const [version, setVersion] = useState<string | null>(null);

  useEffect(() => {
    fetch("/version.json")
      .then((res) => res.json())
      .then((data) => setVersion(data.version))
      .catch(() => setVersion(null));
  }, []);

  if (!version) return null;
  //display the version badge here.
  return (
    <div className="fixed bottom-4 right-4 z-50 px-3 py-1 rounded-full border text-xs font-mono font-semibold shadow bg-gray-900 text-white border-gray-700 opacity-80 pointer-events-none">
      ver. 2.{version}
    </div>
  );
}