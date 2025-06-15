import { useCallback } from "react";

type UserActivities = {
  email: string;
  name: string;
  activities: string[];
  lastUpdate?: number;
};

export const useUserActivitiesStorage = () => {
  const storageKey = "userActivities";

  const loadFromStorage = useCallback((): UserActivities | null => {
    try {
      const data = localStorage.getItem(storageKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      return null;
    }
  }, []);

  const saveToStorage = useCallback((data: UserActivities) => {
    const newData = { ...data, lastUpdate: new Date().getTime() };
    try {
      localStorage.setItem(storageKey, JSON.stringify(newData));
    } catch (error) {
      console.error("Erro ao salvar dados:", error);
    }
  }, []);

  return { loadFromStorage, saveToStorage };
};
