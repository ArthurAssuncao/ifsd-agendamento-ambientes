import { useSupabase } from "@/lib/supabaseClient";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const ListActivities = () => {
  const { data: session } = useSession();
  const supabase = useSupabase();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificações mais robustas
    if (!session?.user?.email || !supabase) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const fetchSubjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from("staff_activities")
          .select("subjects")
          .eq("email", session.user.email)
          .maybeSingle(); // Usamos maybeSingle para evitar erros quando não há dados

        if (!isMounted) return;

        if (supabaseError) {
          throw supabaseError;
        }

        if (data?.subjects) {
          // Processamento mais seguro dos dados
          const subjectsArray =
            typeof data.subjects === "string"
              ? data.subjects
                  .split(",")
                  .map((s) => s.trim())
                  .filter((s) => s)
              : [];
          setSubjects(subjectsArray);
        } else {
          setSubjects([]);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        if (isMounted) {
          setError("Failed to load subjects");
          setSubjects([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSubjects();

    return () => {
      isMounted = false;
    };
  }, [session, supabase]);

  if (loading) {
    return <div>Loading subjects...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Suas Disciplinas</h2>
      {subjects.length > 0 ? (
        <ul className="list-disc pl-5">
          {subjects.map((subject) => (
            <li key={subject} className="py-1">
              {subject}
            </li>
          ))}
        </ul>
      ) : (
        <p>No subjects found</p>
      )}
    </div>
  );
};

export { ListActivities };
