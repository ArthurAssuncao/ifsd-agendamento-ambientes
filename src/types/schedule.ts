export type DaysWeek =
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday"
  | "Sunday";

export type EnvironmentSchedule = {
  id: string;
  environment_id: string;
  week_number: number;
  day_of_week: DaysWeek;
  time_slot: string;
  activity_name: string;
  user_id: string;
  user_email: string;
  booking_time: string;
  class_group?: string;
  created_at: string;
};
