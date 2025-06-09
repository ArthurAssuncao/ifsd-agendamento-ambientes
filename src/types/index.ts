export type User = {
  email: string;
  name: string;
};

export interface ScheduleSlot {
  activity: string;
  user: {
    email: string;
    name: string;
  };
  bookingTime: string;
  details?: string; // Adicione esta linha
}

export type Lab = {
  id: string;
  name: string;
  description?: string;
  capacity?: number;
  equipment?: string[];
};

export type WeekSchedule = {
  [day: string | DaysWeek]: {
    [time: string]: ScheduleSlot;
  };
};

export type UseUserActivitiesReturn = {
  activities: string[];
  loading: boolean;
  error: string | null;
  addActivity: (newActivity: string) => void;
};

export type DaysWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type YearSchedule = {
  [week: number]: {
    [labId: string]: WeekSchedule;
  };
};

export interface BookingSystem {
  year: number;
  weeks: YearSchedule[];
  metadata?: {
    lastUpdated?: string;
    version?: string;
  };
}
