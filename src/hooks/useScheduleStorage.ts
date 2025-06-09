import { WeekSchedule, YearSchedule } from "@/types";
import { useCallback } from "react";

export const useScheduleStorage = () => {
  const storageKey = "scheduleTableData";

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

  return { loadFromStorage, saveToStorage };
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

  console.log("Generated schedule data:", scheduleData);

  return scheduleData;
}
