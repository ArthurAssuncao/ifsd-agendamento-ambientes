// Tipos importados (assumindo que existem em @/types)
import { EMAIL_IFSUDESTEMG_DOMAIN } from "@/lib/constants";
import { useSupabase, useSupabaseWithLock } from "@/lib/supabaseClient";
import {
  checkMinutePassed,
  DAYS_OF_WEEK_TO_ENGLISH,
  daysOfWeekPtBr,
  getNextWeek,
  getWeekNumber,
  MAX_WEEKS_TO_SHOW,
} from "@/lib/utils";
import { DaysWeek, ScheduleSlot, YearSchedule } from "@/types";
import {
  CleanEmptyStructuresFunction,
  ClearSlotFunction,
  DatabaseScheduleItem,
  InitializeEmptyYearScheduleFunction,
  RefreshFunction,
  SupabaseDeleteMatch,
  SupabaseUpsertData,
  SyncSlotFunction,
  UpdateSlotFunction,
  UseScheduleHook,
  UseScheduleReturn,
} from "@/types/useSchedule";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { titleCase } from "title-case";
import { useScheduleStorage } from "./useScheduleStorage";

// Implementação do hook useSchedule
export const useSchedule: UseScheduleHook = (
  sync: boolean
): UseScheduleReturn => {
  const { data: session } = useSession();
  const [schedule, setSchedule] = useState<YearSchedule | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { loadFromStorage, saveToStorage, saveWhenSyncDb, whenSyncDb } =
    useScheduleStorage();
  const supabase = useSupabase();
  const { executeWithLock } = useSupabaseWithLock();

  const extractNameFromEmail = (email: string) => {
    const emailSplitted = email
      .replace(`@${EMAIL_IFSUDESTEMG_DOMAIN}`, "")
      .split(".");
    const name = emailSplitted.join(" ");
    return titleCase(name);
  };

  // 1. Carregamento inicial do schedule
  useEffect(() => {
    const loadSchedule = async (): Promise<void> => {
      if (!session?.user?.email) return;

      setLoading(true);
      try {
        // Tenta carregar do Supabase
        const result = await executeWithLock(async (client) => {
          return await client.from("environment_schedule").select("*");
          // .in("user_email", [session.user.email, EMAIL_SCHEDULE_COMISSION]);
        });

        const { data, error } = result;

        if (error) throw error;

        if ((data as DatabaseScheduleItem[])?.length) {
          const dbSchedule: YearSchedule = {};
          const itensComissao = new Set<DatabaseScheduleItem>();
          // Filtra itens com week_number 100
          const itensServidores = (data as DatabaseScheduleItem[]).filter(
            (item) => {
              if (item.week_number === 100) {
                itensComissao.add(item);
                return false; // Exclui itens com week_number 100
              }
              return true; // Mantém outros itens
            }
          );

          const weeks = new Set<number>();
          const currentWeek = getWeekNumber(new Date());
          weeks.add(currentWeek); // Adiciona a semana atual
          for (let i = 0; i < MAX_WEEKS_TO_SHOW - 1; i++) {
            const weekNumber = getNextWeek(currentWeek);
            weeks.add(weekNumber);
          }

          itensComissao.forEach((item: DatabaseScheduleItem) => {
            for (const weekNumber of weeks) {
              dbSchedule[weekNumber] = dbSchedule[weekNumber] || {};
              dbSchedule[weekNumber][item.environment_id] =
                dbSchedule[weekNumber][item.environment_id] || {};
              dbSchedule[weekNumber][item.environment_id][item.day_of_week] =
                dbSchedule[weekNumber][item.environment_id][item.day_of_week] ||
                {};

              dbSchedule[weekNumber][item.environment_id][item.day_of_week][
                item.time_slot
              ] = {
                activity: item.activity_name,
                user: {
                  email: item.user_email,
                  name: "Comissão de Horários",
                },
                bookingTime: item.booking_time,
                details: item.details || undefined,
                dbSynced: true, // Marca como sincronizado com o DB
              };
            }
          });

          itensServidores.forEach((item: DatabaseScheduleItem) => {
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
                name: extractNameFromEmail(item.user_email),
              },
              bookingTime: item.booking_time,
              details: item.details || undefined,
              dbSynced: true, // Marca como sincronizado com o DB
            };
          });

          if (process.env.NODE_ENV === "development") {
            console.log("Schedule loaded from Supabase:", dbSchedule);
          }

          setSchedule(dbSchedule);
          saveToStorage(dbSchedule);
          saveWhenSyncDb(new Date().getTime());
        } else {
          // Fallback para localStorage
          const storedSchedule: YearSchedule = loadFromStorage();
          setSchedule(storedSchedule || initializeEmptyYearSchedule());
        }
      } catch (err) {
        console.error("Error loading schedule:", err);
        setError("Failed to load schedule");
        // Fallback para localStorage
        const storedSchedule: YearSchedule = loadFromStorage();
        setSchedule(storedSchedule || initializeEmptyYearSchedule());
      } finally {
        setLoading(false);
      }
    };

    const whenSyncedDb: number | null = whenSyncDb();

    if (!whenSyncedDb || (sync && checkMinutePassed(whenSyncedDb))) {
      loadSchedule();
    } else {
      // Se a sincronização com o DB estiver desativada, carrega apenas do localStorage
      const storedSchedule: YearSchedule = loadFromStorage();
      if (process.env.NODE_ENV === "development") {
        console.log("Loading schedule from localStorage:", storedSchedule);
      }

      setSchedule(storedSchedule || initializeEmptyYearSchedule());
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. Persistência automática do schedule
  // useEffect(() => {
  //   if (schedule && !loading) {
  //     const prevSchedule: YearSchedule = loadFromStorage();
  //     if (JSON.stringify(prevSchedule) !== JSON.stringify(schedule)) {
  //       saveToStorage(schedule);
  //       saveWhenSyncDb(new Date().getTime());
  //     }
  //   }
  // }, [schedule, saveToStorage, loading, loadFromStorage, saveWhenSyncDb]);

  const syncSlot: SyncSlotFunction = useCallback(
    async (
      weekNumber: number,
      labId: string,
      day: DaysWeek,
      time: string,
      slot: ScheduleSlot | null
    ): Promise<void> => {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `Syncing slot: week ${weekNumber}, lab ${labId}, day ${day}, time ${time}, slot:`,
          slot
        );
      }
      if (!session?.user?.email || !supabase) return;

      let dayEnglish = day;
      if (daysOfWeekPtBr.includes(day)) {
        dayEnglish = DAYS_OF_WEEK_TO_ENGLISH[day] as DaysWeek;
      }
      if (!dayEnglish) {
        console.error(`Dia da semana inválido: ${day}`);
        return;
      }

      try {
        if (slot) {
          // Upsert (insere ou atualiza)
          const upsertData: SupabaseUpsertData = {
            environment_id: labId,
            week_number: weekNumber,
            day_of_week: dayEnglish,
            time_slot: time,
            activity_name: slot.activity,
            user_email: session.user.email,
            booking_time: slot.bookingTime,
            details: slot.details || null,
          };

          const { error } = await supabase
            .from("environment_schedule")
            .upsert(upsertData, {
              onConflict:
                "environment_id,week_number,day_of_week,time_slot,user_email",
            });

          if (error) throw error;

          // Atualiza o slot localmente para marcar como sincronizado
          setSchedule((prev: YearSchedule | null) => {
            const newSchedule: YearSchedule = prev
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
          const deleteMatch: SupabaseDeleteMatch = {
            environment_id: labId,
            week_number: weekNumber,
            day_of_week: dayEnglish,
            time_slot: time,
            user_email: session.user.email,
          };

          const { error } = await supabase
            .from("environment_schedule")
            .delete()
            .match(deleteMatch);

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
  const updateSlot: UpdateSlotFunction = useCallback(
    (
      weekNumber: number,
      labId: string,
      day: DaysWeek,
      time: string,
      activity?: string
    ): void => {
      if (process.env.NODE_ENV === "development") {
        console.log(
          `Updating slot: week ${weekNumber}, lab ${labId}, day ${day}, time ${time}, activity: ${activity}`
        );
      }

      let dayEnglish = day;
      if (daysOfWeekPtBr.includes(day)) {
        dayEnglish = DAYS_OF_WEEK_TO_ENGLISH[day] as DaysWeek;
      }

      setSchedule((prev: YearSchedule | null) => {
        const newSchedule: YearSchedule = prev
          ? structuredClone(prev)
          : initializeEmptyYearSchedule();

        if (activity && activity?.trim()) {
          const newSlot: ScheduleSlot = {
            activity,
            user: {
              email: session?.user?.email || "",
              name: session?.user?.name || session?.user?.email || "",
            },
            bookingTime: new Date().toISOString(),
          };

          newSchedule[weekNumber] = newSchedule[weekNumber] || {};
          newSchedule[weekNumber][labId] = newSchedule[weekNumber][labId] || {};
          newSchedule[weekNumber][labId][dayEnglish] =
            newSchedule[weekNumber][labId][dayEnglish] || {};
          newSchedule[weekNumber][labId][dayEnglish][time] = newSlot;

          // Sincroniza com o Supabase
          syncSlot(weekNumber, labId, dayEnglish, time, newSlot);
        } else {
          // Remove o slot
          if (process.env.NODE_ENV === "development") {
            console.log(
              `Removing slot (updateSlot else): week ${weekNumber}, lab ${labId}, day ${dayEnglish}, time ${time}`
            );
          }
          if (newSchedule[weekNumber]?.[labId]?.[dayEnglish]?.[time]) {
            delete newSchedule[weekNumber][labId][dayEnglish][time];
            cleanEmptyStructures(newSchedule, weekNumber, labId, dayEnglish);
            // Sincroniza remoção com o Supabase
            syncSlot(weekNumber, labId, dayEnglish, time, null);
          }
        }

        return newSchedule;
      });
    },
    [session?.user?.email, session?.user?.name, syncSlot]
  );

  // 4. Funções auxiliares
  const clearSlot: ClearSlotFunction = useCallback(
    (weekNumber: number, labId: string, day: DaysWeek, time: string): void =>
      updateSlot(weekNumber, labId, day, time, ""),
    [updateSlot]
  );

  const refresh: RefreshFunction = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const storedSchedule: YearSchedule = loadFromStorage();
      setSchedule(storedSchedule || initializeEmptyYearSchedule());
    } finally {
      setLoading(false);
    }
  }, [loadFromStorage]);

  return { schedule, loading, error, updateSlot, clearSlot, refresh };
};

// Função auxiliar para limpar estruturas vazias
const cleanEmptyStructures: CleanEmptyStructuresFunction = (
  schedule: YearSchedule,
  week: number,
  labId: string,
  day: DaysWeek
): void => {
  if (Object.keys(schedule[week][labId][day]).length === 0) {
    delete schedule[week][labId][day];

    if (Object.keys(schedule[week][labId]).length === 0) {
      delete schedule[week][labId];

      if (Object.keys(schedule[week]).length === 0) {
        delete schedule[week];
      }
    }
  }
};

const initializeEmptyYearSchedule: InitializeEmptyYearScheduleFunction =
  (): YearSchedule => {
    return {};
  };
