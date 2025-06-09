import { DaysWeek, YearSchedule } from "@/types";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useScheduleStorage } from "./useScheduleStorage";

export function useSchedule() {
  const { data: session } = useSession();
  const [schedule, setSchedule] = useState<YearSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { loadFromStorage, saveToStorage } = useScheduleStorage();

  // 1. Carregamento inicial do schedule
  useEffect(() => {
    const loadSchedule = async () => {
      if (!session?.user?.email) return;

      setLoading(true);
      try {
        const storedSchedule = loadFromStorage();
        setSchedule(storedSchedule || initializeEmptyYearSchedule());
      } catch (err) {
        console.error("Error loading schedule:", err);
        setError("Failed to load schedule");
        setSchedule(initializeEmptyYearSchedule());
      } finally {
        setLoading(false);
      }
    };

    loadSchedule();
  }, [session?.user?.email, loadFromStorage]); // Dependências essenciais apenas

  // 2. Persistência automática do schedule
  useEffect(() => {
    if (schedule && !loading) {
      const prevSchedule = loadFromStorage();
      if (JSON.stringify(prevSchedule) !== JSON.stringify(schedule)) {
        saveToStorage(schedule);
      }
    }
  }, [schedule, saveToStorage, loading, loadFromStorage]);

  // 3. Função de atualização estável
  const updateSlot = useCallback(
    (
      weekNumber: number,
      labId: string,
      day: DaysWeek,
      time: string,
      activity?: string
    ) => {
      setSchedule((prev) => {
        const newSchedule = prev
          ? structuredClone(prev)
          : initializeEmptyYearSchedule();

        // Cria a estrutura se não existir
        newSchedule[weekNumber] = newSchedule[weekNumber] || {};
        newSchedule[weekNumber][labId] = newSchedule[weekNumber][labId] || {};
        newSchedule[weekNumber][labId][day] =
          newSchedule[weekNumber][labId][day] || {};

        if (activity?.trim()) {
          newSchedule[weekNumber][labId][day][time] = {
            activity,
            user: {
              email: session?.user?.email || "",
              name: session?.user?.name || session?.user?.email || "",
            },
            bookingTime: new Date().toISOString(),
          };
        } else {
          // Remove o slot e limpa estruturas vazias
          delete newSchedule[weekNumber][labId][day][time];
          cleanEmptyStructures(newSchedule, weekNumber, labId, day);
        }

        return newSchedule;
      });
    },
    [session?.user?.email, session?.user?.name]
  );

  // 4. Funções auxiliares
  const clearSlot = useCallback(
    (weekNumber: number, labId: string, day: DaysWeek, time: string) =>
      updateSlot(weekNumber, labId, day, time, ""),
    [updateSlot]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const storedSchedule = loadFromStorage();
      setSchedule(storedSchedule || initializeEmptyYearSchedule());
    } finally {
      setLoading(false);
    }
  }, [loadFromStorage]);

  return { schedule, loading, error, updateSlot, clearSlot, refresh };
}

// Função auxiliar para limpar estruturas vazias
function cleanEmptyStructures(
  schedule: YearSchedule,
  week: number,
  labId: string,
  day: DaysWeek
) {
  if (Object.keys(schedule[week][labId][day]).length === 0) {
    delete schedule[week][labId][day];

    if (Object.keys(schedule[week][labId]).length === 0) {
      delete schedule[week][labId];

      if (Object.keys(schedule[week]).length === 0) {
        delete schedule[week];
      }
    }
  }
}

function initializeEmptyYearSchedule(): YearSchedule {
  return {};
}
