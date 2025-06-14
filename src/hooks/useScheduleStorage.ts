import { WeekSchedule, YearSchedule } from "@/types";
import { useCallback } from "react";

export const useScheduleStorage = () => {
  const storageKey = "scheduleTableData";

  const syncDbKey = "syncDbScheduleData";

  const whenSyncDb = useCallback((): number | null => {
    try {
      const data = localStorage.getItem(syncDbKey);
      if (data) {
        const timestamp = JSON.parse(data);
        if (process.env.NODE_ENV === "development") {
          console.log("DB está sincronizado:", timestamp);
        }
        return timestamp;
      }
      return null;
    } catch (error) {
      console.error("Erro ao sincronizar dados com o DB:", error);
      return null;
    }
  }, []);

  const saveWhenSyncDb = useCallback((syncTimestamp: number) => {
    try {
      localStorage.setItem(syncDbKey, JSON.stringify(syncTimestamp));
      if (process.env.NODE_ENV === "development") {
        console.log("Dados salvos para sincronização com o DB?", syncTimestamp);
      }
    } catch (error) {
      console.error("Erro ao salvar dados para sincronização com o DB:", error);
    }
  }, []);

  const loadFromStorage = useCallback(() => {
    try {
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      return null;
    }
  }, []);

  const saveToStorage = useCallback((data: YearSchedule) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    }
  }, []);

  return { loadFromStorage, saveToStorage, whenSyncDb, saveWhenSyncDb };
};

export function generateScheduleTableData(
  labId: string,
  week: number,
  weekSchedule: WeekSchedule
): YearSchedule {
  const scheduleData: YearSchedule = {
    [week]: {
      [labId]: weekSchedule,
    },
  };

  for (const day in weekSchedule) {
    if (!scheduleData[week][labId][day]) {
      scheduleData[week][labId][day] = {};
    }
    for (const time in weekSchedule[day]) {
      if (!scheduleData[week][labId][day][time]) {
        scheduleData[week][labId][day][time] = weekSchedule[day][time];
      }
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.log("Generated schedule data:", scheduleData);
  }

  return scheduleData;
}
