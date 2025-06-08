import { DaysWeek, ScheduleSlot, YearSchedule } from "@/types";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useScheduleStorage } from "./useScheduleStorage";

type UseScheduleReturn = {
  schedule: YearSchedule | null;
  loading: boolean;
  error: string | null;
  updateSlot: (
    week: number,
    labId: string,
    day: DaysWeek,
    time: string,
    activity?: string
  ) => Promise<void>;
  clearSlot: (
    week: number,
    labId: string,
    day: DaysWeek,
    time: string
  ) => Promise<void>;
  refresh: () => Promise<void>;
};

export function useSchedule(): UseScheduleReturn {
  const { data: session } = useSession();
  const [schedule, setSchedule] = useState<YearSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { loadFromStorage, saveToStorage } = useScheduleStorage();

  const fetchSchedule = useCallback(async () => {
    if (!session) return;

    setLoading(true);
    setError(null);

    try {
      // Simulação de dados - substituir por chamada API real
      // const mockData: YearSchedule = {
      //   [week]: {
      //     [labId]: {
      //       Monday: {
      //         "09:00": {
      //           activity: "Aula de Matemática",
      //           user: {
      //             email: session.user?.email || "",
      //             name: session.user?.name || session.user?.email || "",
      //           },
      //           bookingTime: new Date().toISOString(),
      //         },
      //         "10:00": {
      //           activity: "Pesquisa em Física",
      //           user: {
      //             email: session.user?.email || "",
      //             name: session.user?.name || session.user?.email || "",
      //           },
      //           bookingTime: new Date().toISOString(),
      //         },
      //       },
      //     },
      //   },
      // };
      const storedSchedule = loadFromStorage();
      if (storedSchedule) {
        setSchedule(storedSchedule);
      } else {
        setSchedule(initializeEmptyYearSchedule());
      }
    } catch (err) {
      console.error("Error fetching schedule:", err);
      setError("Falha ao carregar agendamentos");
      setSchedule(initializeEmptyYearSchedule());
    } finally {
      setLoading(false);
    }
  }, [loadFromStorage, session]);

  useEffect(() => {
    fetchSchedule();
  }, [fetchSchedule]);

  const updateSlot = useCallback(
    async (
      weekNumber: number,
      labId: string,
      day: DaysWeek,
      time: string,
      activity?: string
    ) => {
      if (!session?.user?.email) return;

      try {
        setLoading(true);

        setSchedule((prevSchedule) => {
          const currentSchedule = prevSchedule
            ? { ...prevSchedule }
            : initializeEmptyYearSchedule();

          // Initialize week if not exists
          if (!currentSchedule[weekNumber]) {
            currentSchedule[weekNumber] = {};
          }

          // Initialize lab if not exists
          if (!currentSchedule[weekNumber][labId]) {
            currentSchedule[weekNumber][labId] = {};
          }

          // Initialize day if not exists
          if (!currentSchedule[weekNumber][labId][day]) {
            currentSchedule[weekNumber][labId][day] = {};
          }

          if (activity && activity.trim()) {
            // Update or create slot
            currentSchedule[weekNumber][labId][day][time] = {
              activity,
              user: {
                email: session?.user?.email || "",
                name: session?.user?.name || session.user?.email || "",
              },
              bookingTime: new Date().toISOString(),
            };

            saveToStorage(currentSchedule);
          } else {
            // Clear slot
            delete currentSchedule[weekNumber][labId][day][time];

            // Clean up empty days
            if (
              Object.keys(currentSchedule[weekNumber][labId][day]).length === 0
            ) {
              delete currentSchedule[weekNumber][labId][day];
            }

            // Clean up empty labs
            if (Object.keys(currentSchedule[weekNumber][labId]).length === 0) {
              delete currentSchedule[weekNumber][labId];
            }

            // Clean up empty weeks
            if (Object.keys(currentSchedule[weekNumber]).length === 0) {
              delete currentSchedule[weekNumber];
            }
          }
          saveToStorage(currentSchedule);

          return currentSchedule;
        });
      } catch (err) {
        console.error("Error updating slot:", err);
        setError("Falha ao atualizar agendamento");
      } finally {
        setLoading(false);
      }
    },
    [session]
  );

  const clearSlot = useCallback(
    async (weekNumber: number, labId: string, day: DaysWeek, time: string) => {
      await updateSlot(weekNumber, labId, day, time, "");
    },
    [updateSlot]
  );

  const refresh = useCallback(async () => {
    await fetchSchedule();
  }, [fetchSchedule]);

  return {
    schedule,
    loading,
    error,
    updateSlot,
    clearSlot,
    refresh,
  };
}

function initializeEmptyYearSchedule(): YearSchedule {
  return {};
}

// Helper function to check if a slot is booked by the current user
export function isSlotBookedByUser(
  slot: ScheduleSlot | undefined,
  userEmail: string
): boolean {
  return !!slot && slot.user.email === userEmail;
}
