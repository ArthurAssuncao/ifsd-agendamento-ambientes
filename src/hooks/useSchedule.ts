import { useSupabase } from "@/lib/supabaseClient";
import { checkMinutePassed, DAYS_OF_WEEK_TO_ENGLISH } from "@/lib/utils";
import { DaysWeek, ScheduleSlot, YearSchedule } from "@/types";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useScheduleStorage } from "./useScheduleStorage";

export function useSchedule(sync: boolean) {
  const { data: session } = useSession();
  const [schedule, setSchedule] = useState<YearSchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { loadFromStorage, saveToStorage, saveWhenSyncDb, whenSyncDb } =
    useScheduleStorage();
  const supabase = useSupabase();

  // 1. Carregamento inicial do schedule
  useEffect(() => {
    const loadSchedule = async () => {
      if (!session?.user?.email) return;

      setLoading(true);
      try {
        // Tenta carregar do Supabase
        const { data, error } = await supabase
          .from("environment_schedule")
          .select("*")
          .eq("user_email", session.user.email);

        if (error) throw error;

        if (data?.length) {
          const dbSchedule: YearSchedule = {};
          data.forEach((item) => {
            dbSchedule[item.week_number] = dbSchedule[item.week_number] || {};
            dbSchedule[item.week_number][item.environment_id] =
              dbSchedule[item.week_number][item.environment_id] || {};
            dbSchedule[item.week_number][item.environment_id][
              item.day_of_week
            ] =
              dbSchedule[item.week_number][item.environment_id][
                item.day_of_week
              ] || {};

            dbSchedule[item.week_number][item.environment_id][item.day_of_week][
              item.time_slot
            ] = {
              activity: item.activity_name,
              user: {
                email: item.user_email,
                name: session.user?.name || item.user_email,
              },
              bookingTime: item.booking_time,
              details: item.details || undefined,
              dbSynced: true, // Marca como sincronizado com o DB
            };
          });

          console.log("Schedule loaded from Supabase:", dbSchedule);

          setSchedule(dbSchedule);
          saveToStorage(dbSchedule);
          saveWhenSyncDb(new Date().getTime());
        } else {
          // Fallback para localStorage
          const storedSchedule = loadFromStorage();
          setSchedule(storedSchedule || initializeEmptyYearSchedule());
        }
      } catch (err) {
        console.error("Error loading schedule:", err);
        setError("Failed to load schedule");
        // Fallback para localStorage
        const storedSchedule = loadFromStorage();
        setSchedule(storedSchedule || initializeEmptyYearSchedule());
      } finally {
        setLoading(false);
      }
    };

    const whenSyncedDb = whenSyncDb();

    if (!whenSyncedDb || (sync && checkMinutePassed(whenSyncedDb))) {
      loadSchedule();
    } else {
      // Se a sincronização com o DB estiver desativada, carrega apenas do localStorage
      const storedSchedule: YearSchedule = loadFromStorage();
      console.log("Loading schedule from localStorage:", storedSchedule);

      setSchedule(storedSchedule || initializeEmptyYearSchedule());
      setLoading(false);
    }
  }, [
    session?.user.email,
    supabase,
    loadFromStorage,
    saveToStorage,
    session?.user?.name,
    whenSyncDb,
    saveWhenSyncDb,
    sync,
  ]);

  //   const loadSchedule = async () => {
  //     if (!session?.user?.email) return;

  //     setLoading(true);
  //     try {
  //       const storedSchedule = loadFromStorage();
  //       setSchedule(storedSchedule || initializeEmptyYearSchedule());
  //     } catch (err) {
  //       console.error("Error loading schedule:", err);
  //       setError("Failed to load schedule");
  //       setSchedule(initializeEmptyYearSchedule());
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   loadSchedule();
  // }, [session?.user?.email, loadFromStorage]); // Dependências essenciais apenas

  // 2. Persistência automática do schedule
  useEffect(() => {
    if (schedule && !loading) {
      const prevSchedule = loadFromStorage();
      if (JSON.stringify(prevSchedule) !== JSON.stringify(schedule)) {
        saveToStorage(schedule);
      }
    }
  }, [schedule, saveToStorage, loading, loadFromStorage]);

  const syncSlot = useCallback(
    async (
      weekNumber: number,
      labId: string,
      day: DaysWeek,
      time: string,
      slot: ScheduleSlot | null
    ) => {
      if (!session?.user?.email || !supabase) return;

      const dayEnglish = DAYS_OF_WEEK_TO_ENGLISH[day];
      if (!dayEnglish) {
        console.error(`Dia da semana inválido: ${day}`);
        return;
      }

      try {
        if (slot) {
          // Upsert (insere ou atualiza)
          const { error } = await supabase.from("environment_schedule").upsert(
            {
              environment_id: labId,
              week_number: weekNumber,
              day_of_week: dayEnglish,
              time_slot: time,
              activity_name: slot.activity,
              user_email: session.user.email,
              booking_time: slot.bookingTime,
              details: slot.details || null,
            },
            {
              onConflict:
                "environment_id,week_number,day_of_week,time_slot,user_email",
            }
          );

          if (error) throw error;

          // Atualiza o slot localmente para marcar como sincronizado

          setSchedule((prev) => {
            const newSchedule = prev
              ? structuredClone(prev)
              : initializeEmptyYearSchedule();
            newSchedule[weekNumber] = newSchedule[weekNumber] || {};
            newSchedule[weekNumber][labId] =
              newSchedule[weekNumber][labId] || {};
            newSchedule[weekNumber][labId][dayEnglish] =
              newSchedule[weekNumber][labId][dayEnglish] || {};
            newSchedule[weekNumber][labId][dayEnglish][time] = {
              ...slot,
              dbSynced: true, // Marca como sincronizado com o DB
            };
            return newSchedule;
          });
        } else {
          // Remove slot se existir
          const { error } = await supabase
            .from("environment_schedule")
            .delete()
            .match({
              environment_id: labId,
              week_number: weekNumber,
              day_of_week: DAYS_OF_WEEK_TO_ENGLISH[day],
              time_slot: time,
              user_email: session.user.email,
            });

          if (error) throw error;
        }
      } catch (err) {
        console.error("Erro na sincronização:", err);
        // Você pode adicionar uma fila de retentativas aqui se quiser
      }
    },
    [session?.user?.email, supabase]
  );

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

        if (activity?.trim()) {
          const newSlot = {
            activity,
            user: {
              email: session?.user?.email || "",
              name: session?.user?.name || session?.user?.email || "",
            },
            bookingTime: new Date().toISOString(),
          };

          newSchedule[weekNumber] = newSchedule[weekNumber] || {};
          newSchedule[weekNumber][labId] = newSchedule[weekNumber][labId] || {};
          newSchedule[weekNumber][labId][day] =
            newSchedule[weekNumber][labId][day] || {};
          newSchedule[weekNumber][labId][day][time] = newSlot;

          // Sincroniza com o Supabase
          syncSlot(weekNumber, labId, day, time, newSlot);
        } else {
          // Remove o slot
          if (newSchedule[weekNumber]?.[labId]?.[day]?.[time]) {
            delete newSchedule[weekNumber][labId][day][time];
            cleanEmptyStructures(newSchedule, weekNumber, labId, day);
            // Sincroniza remoção com o Supabase
            syncSlot(weekNumber, labId, day, time, null);
          }
        }

        return newSchedule;
      });
    },
    [session?.user?.email, session?.user?.name, syncSlot]
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
