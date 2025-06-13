// src/hooks/useEmailColors.ts
import { TIME_SLOT_COLORS } from "@/lib/constants";
import { useEffect, useState } from "react";

export function useEmailColors() {
  const [colorsMap, setColorsMap] = useState<Record<string, string>>({});

  // Carrega cores ao iniciar
  useEffect(() => {
    const loadColors = () => {
      try {
        const stored =
          localStorage.getItem("emailColors") ||
          document.cookie
            .split("; ")
            .find((row) => row.startsWith("emailColors="))
            ?.split("=")[1] ||
          "{}";
        setColorsMap(JSON.parse(stored));
      } catch {
        setColorsMap({});
      }
    };

    loadColors();
    window.addEventListener("storage", loadColors); // Sincroniza entre tabs

    return () => window.removeEventListener("storage", loadColors);
  }, []);

  const getEmailColor = (email: string) => {
    return (
      colorsMap[email] ||
      TIME_SLOT_COLORS[Object.keys(colorsMap).length % TIME_SLOT_COLORS.length]
    );
  };

  return { getEmailColor };
}
