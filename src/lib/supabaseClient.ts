// lib/supabaseClient.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

let supabaseClient: SupabaseClient = null as unknown as SupabaseClient;

export const useSupabase = (): SupabaseClient => {
  const { data: session } = useSession();

  // Cliente singleton para uso não autenticado
  if (!supabaseClient) {
    supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.supabaseAccessToken}`,
          },
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }

  return useMemo(() => {
    if (!session?.supabaseAccessToken) return supabaseClient;

    // Reutiliza a mesma instância, apenas atualizando o header de autenticação
    const authenticatedClient = supabaseClient;
    authenticatedClient.realtime.setAuth(session.supabaseAccessToken);

    return authenticatedClient;
  }, [session?.supabaseAccessToken]);
};
