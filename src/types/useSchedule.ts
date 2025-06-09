// Tipos importados (assumindo que existem em @/types)
import { DaysWeek, ScheduleSlot, YearSchedule } from "@/types";

// Tipos do hook useSchedule
export interface UseScheduleParams {
  sync: boolean;
}

export interface UseScheduleReturn {
  schedule: YearSchedule | null;
  loading: boolean;
  error: string | null;
  updateSlot: (
    weekNumber: number,
    labId: string,
    day: DaysWeek,
    time: string,
    activity?: string
  ) => void;
  clearSlot: (
    weekNumber: number,
    labId: string,
    day: DaysWeek,
    time: string
  ) => void;
  refresh: () => Promise<void>;
}

// Tipos das funções internas
export type SyncSlotFunction = (
  weekNumber: number,
  labId: string,
  day: DaysWeek,
  time: string,
  slot: ScheduleSlot | null
) => Promise<void>;

export type UpdateSlotFunction = (
  weekNumber: number,
  labId: string,
  day: DaysWeek,
  time: string,
  activity?: string
) => void;

export type ClearSlotFunction = (
  weekNumber: number,
  labId: string,
  day: DaysWeek,
  time: string
) => void;

export type RefreshFunction = () => Promise<void>;

// Tipos auxiliares
export interface DatabaseScheduleItem {
  environment_id: string;
  week_number: number;
  day_of_week: string;
  time_slot: string;
  activity_name: string;
  user_email: string;
  booking_time: string;
  details?: string | null;
}

export interface ScheduleUser {
  email: string;
  name: string;
}

export interface EnhancedScheduleSlot extends ScheduleSlot {
  dbSynced?: boolean; // Propriedade adicional para controle de sincronização
}

// Tipos das funções utilitárias
export type CleanEmptyStructuresFunction = (
  schedule: YearSchedule,
  week: number,
  labId: string,
  day: DaysWeek
) => void;

export type InitializeEmptyYearScheduleFunction = () => YearSchedule;

// Tipo da função principal do hook
export type UseScheduleHook = (sync: boolean) => UseScheduleReturn;

// Tipos para controle de estado interno
export interface ScheduleState {
  schedule: YearSchedule | null;
  loading: boolean;
  error: string | null;
}

// Tipos para parâmetros de upsert do Supabase
export interface SupabaseUpsertData {
  environment_id: string;
  week_number: number;
  day_of_week: string;
  time_slot: string;
  activity_name: string;
  user_email: string;
  booking_time: string;
  details: string | null;
}

// Tipos para parâmetros de delete do Supabase
export interface SupabaseDeleteMatch {
  environment_id: string;
  week_number: number;
  day_of_week: string;
  time_slot: string;
  user_email: string;
}

// Tipos para dependências do hook
export interface UseScheduleStorageReturn {
  loadFromStorage: () => YearSchedule;
  saveToStorage: (schedule: YearSchedule) => void;
  saveWhenSyncDb: (timestamp: number) => void;
  whenSyncDb: () => number | null;
}

// Exemplo de uso dos tipos
/*
// Implementação do hook
const useSchedule: UseScheduleHook = (sync: boolean): UseScheduleReturn => {
  // ... implementação
};

// Uso do hook
const {
  schedule,
  loading,
  error,
  updateSlot,
  clearSlot,
  refresh
}: UseScheduleReturn = useSchedule(true);
*/
