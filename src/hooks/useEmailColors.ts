// src/hooks/useEmailColors.ts
import { TIME_SLOT_COLORS } from "@/lib/constants";
import { useEffect, useRef, useState } from "react";

type EmailColors = Record<string, string>;

export function useEmailColors() {
  const [colorsMap, setColorsMap] = useState<EmailColors>({});
  const [isLoaded, setIsLoaded] = useState(false);
  const colorsMapRef = useRef<Record<string, string>>({});
  const nextColorIndexRef = useRef(0);

  // Carrega cores do localStorage/cookie ao iniciar
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

        const parsed = JSON.parse(stored);

        // Verifica duplicatas ao carregar
        const duplicatesFound = checkForDuplicateColors(parsed);
        if (duplicatesFound) {
          localStorage.setItem("emailColors", JSON.stringify({}));
          document.cookie = `emailColors=${JSON.stringify(
            {}
          )}; path=/; max-age=${60 * 60 * 24 * 30}`;
        }

        colorsMapRef.current = parsed;
        nextColorIndexRef.current = Object.keys(parsed).length;
        setColorsMap(parsed);

        if (process.env.NODE_ENV === "development") {
          console.log("Cores carregadas:", parsed);
        }
      } catch (error) {
        console.error("Failed to load email colors:", error);
        colorsMapRef.current = {};
        nextColorIndexRef.current = 0;
        setColorsMap({});
      } finally {
        setIsLoaded(true);
      }
    };

    loadColors();
    window.addEventListener("storage", loadColors);

    return () => window.removeEventListener("storage", loadColors);
  }, []);

  // Persiste no localStorage sempre que colorsMap mudar
  useEffect(() => {
    if (!isLoaded) return;

    try {
      localStorage.setItem("emailColors", JSON.stringify(colorsMap));
      document.cookie = `emailColors=${JSON.stringify(
        colorsMap
      )}; path=/; max-age=${60 * 60 * 24 * 30}`;
    } catch (error) {
      console.error("Failed to save email colors:", error);
    }
  }, [colorsMap, isLoaded]);

  const checkForDuplicateColors = (colors: EmailColors): boolean => {
    const colorValues = Object.values(colors);
    const uniqueColors = new Set(colorValues);
    return colorValues.length !== uniqueColors.size;
  };

  const getEmailColor = (email: string | undefined | null): string => {
    if (!email) return TIME_SLOT_COLORS[TIME_SLOT_COLORS.length - 1];

    // Verifica no ref primeiro (síncrono)
    if (colorsMapRef.current[email]) {
      return colorsMapRef.current[email];
    }

    // Atribui uma nova cor de forma síncrona
    const newColor =
      TIME_SLOT_COLORS[nextColorIndexRef.current % TIME_SLOT_COLORS.length];
    nextColorIndexRef.current++;

    // Atualiza a referência imediatamente
    colorsMapRef.current = { ...colorsMapRef.current, [email]: newColor };

    // Dispara a atualização do estado (assíncrona)
    setColorsMap(colorsMapRef.current);

    if (process.env.NODE_ENV === "development") {
      console.log("Atribuída nova cor:", email, newColor);
    }

    return newColor;
  };

  const updateEmailColor = (email: string, color: string) => {
    colorsMapRef.current = { ...colorsMapRef.current, [email]: color };
    setColorsMap(colorsMapRef.current);
  };

  return {
    getEmailColor,
    updateEmailColor,
    emailColors: colorsMap,
    isLoaded,
  };
}
