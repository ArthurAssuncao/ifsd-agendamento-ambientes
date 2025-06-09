import { useSupabase } from "@/lib/supabaseClient";
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

  // Usamos ref para valores mutáveis que não devem disparar recriações
  const sessionRef = useRef(session);
  sessionRef.current = session;

  useEffect(() => {
    let isMounted = true;

    const fetchActivities = async () => {
      // Só executa se houver email e supabase
      if (!sessionRef.current?.user?.email || !supabase) {
        if (isMounted) setLoading(false);
        return;
      }

      // Debug: verifique se está sendo chamado sem necessidade
      console.log("Fetching user activities...");

      try {
        if (isMounted) setLoading(true);

        const { data, error } = await supabase
          .from("staff_activities")
          .select("subjects")
          .eq("email", sessionRef.current.user.email)
          .maybeSingle();

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
                "Outra atividade",
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
          const newActivitiesDefault = [
            "Aula",
            "Projeto",
            "Reunião",
            "Outra atividade",
          ];
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

    const activitiesFromStorage = loadFromStorage();
    if (activitiesFromStorage && activitiesFromStorage.activities.length > 0) {
      // Se houver atividades no armazenamento, use-as
      setActivities(activitiesFromStorage.activities);
      setLoading(false);
    } else {
      // Caso contrário, busque do Supabase
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
