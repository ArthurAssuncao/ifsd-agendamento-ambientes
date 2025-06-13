import { useSchedule } from "@/hooks/useSchedule";
import {
  DAYS_OF_WEEK_TO_ENGLISH,
  daysOfWeekPtBr,
  getDateAddedDays,
  getDateFromWeek,
  getNextTime,
  timeSlots,
} from "@/lib/utils";
import { DaysWeek, ScheduleSlot } from "@/types";
import { useState } from "react";
import { ContextMenu, ContextMenuData } from "../ContextMenu";
import { TimeSlot } from "./TimeSlot";

type TimeTableProps = {
  labId: string;
  week: number;
};

const getSlotClasses = (period: string) => {
  if (period.includes("break")) {
    return {
      row: "bg-gray-300 h-16",
      timeCell: "bg-gray-400 font-semibold h-16",
      slotCell: "bg-gray-400 h-16",
    };
  }
  return {
    row: "",
    timeCell: "h-32",
    slotCell: "",
  };
};

export function TimeTable({ labId, week }: TimeTableProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);
  const { schedule, updateSlot } = useSchedule(true);

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleRemoveActivity = () => {
    if (!contextMenu) return;

    console.log("Remover atividade:", contextMenu);

    const { labId, week, time, day } = contextMenu;
    updateSlot(week, labId, day as DaysWeek, time);

    closeContextMenu();
  };

  const contextActions = [
    {
      label: "Remover",
      handler: handleRemoveActivity,
    },
  ];

  return (
    <div className="min-w-full overflow-x-auto mt-4 bg-white rounded-lg shadow-md overflow-hidden">
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
          actions={contextActions}
        />
      )}
      <div className="min-w-full bg-white rounded-lg shadow ">
        {/* Cabeçalho com dias da semana */}
        <div className="bg-gray-100">
          <div className="grid grid-cols-7 border-b border-gray-300 bg-gray-100 z-[1]  sticky top-0 mr-[15]">
            <div className="p-4 font-bold text-center border-r border-gray-300">
              Horário
            </div>
            {daysOfWeekPtBr.map((day, index) => (
              <div
                key={day}
                className="p-4 font-bold text-center border-r border-gray-300 last-of-type:border-r-0"
              >
                {day} (
                {getDateAddedDays(
                  getDateFromWeek(week),
                  index
                ).toLocaleDateString("pt-BR", {
                  month: "numeric",
                  day: "numeric",
                })}
                )
              </div>
            ))}
          </div>
        </div>

        <div
          className="overflow-y-auto"
          style={{
            maxHeight: "calc(100vh - 200px)",
            scrollbarGutter: "stable",
          }}
        >
          {/* Linhas de horários */}
          {timeSlots.map((slot, index) => {
            const classes = getSlotClasses(slot.period);

            return (
              <div
                key={slot.time}
                className={`grid grid-cols-7 border-b border-gray-300 last-of-type:border-b-0 ${
                  classes.row
                } ${index % 2 === 1 ? "bg-gray-50" : ""}`}
              >
                <div
                  className={`flex p-4 items-center justify-center font-medium border-r border-gray-300 last-of-type:border-r-0 ${classes.timeCell}`}
                >
                  {slot.time} a {getNextTime(slot.time)}
                </div>
                {daysOfWeekPtBr.map((day) => {
                  const scheduleSlot: ScheduleSlot | undefined =
                    schedule?.[week]?.[labId]?.[
                      DAYS_OF_WEEK_TO_ENGLISH[day] as DaysWeek
                    ]?.[slot.time];

                  return (
                    <TimeSlot
                      key={`${day}-${slot.time}`}
                      day={day}
                      time={slot.time}
                      labId={labId}
                      week={week}
                      className={`border-r border-gray-300 last-of-type:border-r-0 ${classes.slotCell}`}
                      setContextMenu={setContextMenu}
                      scheduleSlot={scheduleSlot}
                      updateSlot={updateSlot}
                      disabled={slot.period.includes("break")}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
