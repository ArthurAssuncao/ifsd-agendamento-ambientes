import { useSupabase, useSupabaseWithLock } from "@/lib/supabaseClient";
import { checkMinutePassed } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useUserActivitiesStorage } from "./useUserActivitiesStorage";

export function useUserActivities() {
  const { data: session } = useSession();
  const supabase = useSupabase();
  const [activities, setActivities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { loadFromStorage, saveToStorage } = useUserActivitiesStorage();
  const { executeWithLock } = useSupabaseWithLock();

  // Usamos ref para valores mutáveis que não devem disparar recriações
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const newActivitiesDefault = [
    "Aula",
    "Projeto",
    "Reunião",
    "Outra atividade",
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchActivities = async () => {
      // Só executa se houver email e supabase
      if (!sessionRef.current?.user?.email || !supabase) {
        if (isMounted) setLoading(false);
        return;
      }

      // Debug: verifique se está sendo chamado sem necessidade
      if (process.env.NODE_ENV === "development") {
        console.log("Fetching user activities...");
      }

      try {
        if (isMounted) setLoading(true);

        // const { data, error } = await supabase
        //   .from("staff_activities")
        //   .select("subjects")
        //   .eq("email", sessionRef.current.user.email)
        //   .maybeSingle();

        const result = await executeWithLock(async (client) => {
          return await client
            .from("staff_activities")
            .select("subjects")
            .eq("email", sessionRef?.current?.user.email)
            .maybeSingle();
        });

        const { data, error } = result;

        if (!isMounted) return;

        if (error) throw error;

        // Atualiza apenas se os dados forem diferentes
        const newActivities = data?.subjects
          ? [
              ...new Set([
                ...data.subjects
                  .split(",")
                  .map((s: string) => s.trim())
                  .filter(Boolean),
                ...newActivitiesDefault,
              ]),
            ]
          : ["Aula", "Projeto", "Reunião", "Outra atividade"];

        if (isMounted) {
          setActivities((prev) => {
            const newActivitiesOrPrev =
              JSON.stringify(prev) === JSON.stringify(newActivities)
                ? prev
                : newActivities;
            saveToStorage({
              email: sessionRef?.current?.user.email || "",
              name: sessionRef?.current?.user.name || "",
              activities: newActivitiesOrPrev,
            });
            return newActivitiesOrPrev;
          });
        }
      } catch (err) {
        console.error("Error fetching activities:", err);
        if (isMounted) {
          setError("Falha ao carregar atividades");
          setActivities(newActivitiesDefault);
          saveToStorage({
            email: sessionRef?.current?.user.email || "",
            name: sessionRef?.current?.user.name || "",
            activities: newActivitiesDefault,
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    const verifyEachHour = 1 * 60;
    const activitiesFromStorage = loadFromStorage();
    if (
      activitiesFromStorage &&
      activitiesFromStorage.activities.length > newActivitiesDefault.length &&
      (activitiesFromStorage.lastUpdate === undefined ||
        !checkMinutePassed(activitiesFromStorage.lastUpdate, verifyEachHour))
    ) {
      // Se houver atividades no armazenamento, use-as
      if (process.env.NODE_ENV === "development") {
        console.log("Usando atividades do localstorage");
      }
      setActivities(activitiesFromStorage.activities);
      setLoading(false);
    } else {
      // Caso contrário, busque do Supabase
      if (process.env.NODE_ENV === "development") {
        console.log("Atualizando atividades");
      }
      fetchActivities();
    }

    return () => {
      isMounted = false;
    };
  }, [loadFromStorage, saveToStorage, supabase]); // Dependência: apenas `supabase` (deve ser estável)

  const addActivity = (newActivity: string) => {
    setActivities((prev) => {
      const trimmed = newActivity.trim();
      if (trimmed && !prev.includes(trimmed)) {
        return [...prev, trimmed];
      }
      return prev;
    });
  };

  return {
    activities,
    loading,
    error,
    addActivity,
  };
}
