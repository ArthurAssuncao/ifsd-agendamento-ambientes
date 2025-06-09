// lib/supabaseClient.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { useSession } from "next-auth/react";
import { useMemo } from "react";

let supabaseClient: SupabaseClient = null as unknown as SupabaseClient;

// Sistema de lock/queue para controlar execuções simultâneas
class SupabaseQueue {
  private queue: Array<() => void> = [];
  private isProcessing = false;

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      const operation = this.queue.shift();
      if (operation) {
        await operation();
      }
    }

    this.isProcessing = false;
  }
}

// Instância global da queue
const supabaseQueue = new SupabaseQueue();

// Wrapper para operações do Supabase com lock
export const createSupabaseOperation = <T>(
  operation: (client: SupabaseClient) => Promise<T>
) => {
  return (client: SupabaseClient): Promise<T> => {
    return supabaseQueue.execute(() => operation(client));
  };
};

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

// Hook para usar operações com lock
export const useSupabaseWithLock = () => {
  const client = useSupabase();

  return {
    client,
    executeWithLock: <T>(operation: (client: SupabaseClient) => Promise<T>) => {
      return createSupabaseOperation(operation)(client);
    },
  };
};

// Exemplo de uso direto com funções helper
export const supabaseOperations = {
  select: (table: string, query?: string) =>
    createSupabaseOperation(async (client) => {
      const queryBuilder = client.from(table).select(query || "*");
      return await queryBuilder;
    }),

  insert: (table: string, data: unknown) =>
    createSupabaseOperation(async (client) => {
      return await client.from(table).insert(data);
    }),

  update: (table: string, data: unknown, filter: Record<string, unknown>) =>
    createSupabaseOperation(async (client) => {
      return await client.from(table).update(data).match(filter);
    }),

  delete: (table: string, filter: Record<string, unknown>) =>
    createSupabaseOperation(async (client) => {
      return await client.from(table).delete().match(filter);
    }),
};
