import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export function useUserActivities() {
  const { data: session } = useSession();
  const [activities, setActivities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchActivities() {
      if (!session?.user?.email) return;

      try {
        setLoading(true);
        const userActivities = ["Aula", "Pesquisa", "Reunião"];
        setActivities([...userActivities, "Outra atividade"]);
      } catch (err) {
        console.error("Error fetching user activities:", err);
        setError("Falha ao carregar atividades");
        setActivities(["Aula", "Pesquisa", "Reunião", "Outra atividade"]); // Fallback
      } finally {
        setLoading(false);
      }
    }

    fetchActivities();
  }, [session, session?.user?.email]);

  const addActivity = (newActivity: string) => {
    if (newActivity.trim() && !activities.includes(newActivity)) {
      setActivities([...activities, newActivity]);
    }
  };

  return {
    activities,
    loading,
    error,
    addActivity,
  };
}
