import { useSchedule } from "@/hooks";
import { ENVIRONMENTS } from "@/lib/constants";
import { useState } from "react";
import { Loading } from "../Loading";
import { TimeTable } from "./TimeTable";

type SchedulesProps = {
  currentWeek: number;
};

export const Schedules = ({ currentWeek }: SchedulesProps) => {
  const [currentLab, setCurrentLab] = useState<string>("LabInf1"); //setCurrentLab
  const { schedule, loading } = useSchedule(true);

  // Número máximo de semanas para exibir

  return (
    <div className="flex justify-center flex-col w-full">
      <div className="flex items-center justify-center w-full lg:gap-2 flex-wrap lg:flex-nowrap">
        {ENVIRONMENTS.map((env) => (
          <button
            key={env.id}
            className={`min-w-36 px-4 py-2 m-1 rounded-lg text-sm font-semibold hover:cursor-pointer  ${
              currentLab === env.id
                ? "bg-green-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setCurrentLab(env.id)}
          >
            {env.shortName}
          </button>
        ))}
      </div>
      {loading && <Loading />}
      {schedule && <TimeTable labId={currentLab} week={currentWeek} />}
    </div>
  );
};
