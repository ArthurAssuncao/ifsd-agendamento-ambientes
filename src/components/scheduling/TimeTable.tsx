import { useSchedule } from "@/hooks/useSchedule";
import {
  DAYS_OF_WEEK_TO_ENGLISH,
  daysOfWeek,
  getDateAddedDays,
  getDateFromWeek,
  getNextTime,
  timeSlots,
} from "@/lib/utils";
import { DaysWeek, ScheduleSlot } from "@/types";
import { useEffect, useRef, useState } from "react";
import { ContextMenu, ContextMenuData } from "../ContextMenu";
import { TimeSlot } from "./TimeSlot";

type TimeTableProps = {
  labId: string;
  week: number;
};

const getSlotClasses = (period: string) => {
  if (period.includes("break")) {
    return {
      col: "bg-gray-300 w-full",
      timeHeader: "bg-gray-400 font-semibold",
      slotCell: "bg-gray-400",
    };
  }
  return {
    col: "",
    timeHeader: "",
    slotCell: "",
  };
};

export function TimeTable({ labId, week }: TimeTableProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);
  const { schedule, updateSlot } = useSchedule(true);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isUserScroll = useRef(true);

  useEffect(() => {
    columnRefs.current = columnRefs.current.slice(0, 7);
  }, []);

  useEffect(() => {
    const columns = columnRefs.current.filter(Boolean) as HTMLDivElement[];

    const handleScroll = (scrolledColumn: HTMLDivElement) => {
      if (!isUserScroll.current) return;
      isUserScroll.current = false;

      const scrollTop = scrolledColumn.scrollTop;
      columns.forEach((col) => (col.scrollTop = scrollTop));

      requestAnimationFrame(() => {
        isUserScroll.current = true;
      });
    };

    const listeners = columns.map((col) => {
      const handler = () => handleScroll(col);
      col.addEventListener("scroll", handler);
      return { col, handler };
    });

    return () =>
      listeners.forEach(({ col, handler }) =>
        col.removeEventListener("scroll", handler)
      );
  }, []);

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleRemoveActivity = () => {
    if (!contextMenu) return;

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
    <div className="min-w-full overflow-x-auto mt-4 bg-white rounded-lg shadow-md">
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={closeContextMenu}
          actions={contextActions}
        />
      )}

      <div className="flex flex-1 flex-nowrap min-w-full bg-white rounded-lg shadow">
        {/* Coluna de horários */}
        <div
          className="bg-gray-100 min-w-[120px] border-r border-gray-300 overscroll-auto scrollbar-none overflow-y-scroll"
          style={{
            maxHeight: "calc(100vh - 200px)",
            scrollbarGutter: "stable",
          }}
          ref={(el: HTMLDivElement | null) => {
            columnRefs.current[0] = el;
          }}
        >
          <div className="h-[60px] flex items-center justify-center font-bold border-b border-gray-300 bg-gray-100 sticky top-0 z-10">
            Horário \ Dia
          </div>
          {timeSlots.map((slot) => {
            const classes = getSlotClasses(slot.period);
            return (
              <div
                key={slot.time}
                className={`h-16 flex items-center justify-center font-medium border-b border-gray-300 ${classes.timeHeader}`}
              >
                {slot.time} - {getNextTime(slot.time)}
              </div>
            );
          })}
        </div>

        {/* Colunas de dias da semana */}
        <div className="flex flex-1 ">
          {daysOfWeek.map((day, dayIndex) => {
            const date = getDateAddedDays(getDateFromWeek(week), dayIndex);
            return (
              <div
                key={day}
                ref={(el: HTMLDivElement | null) => {
                  columnRefs.current[dayIndex + 1] = el;
                }}
                className={`overscroll-auto scrollbar-none overflow-y-scroll flex-1 min-w-[150px] border-r border-gray-300 last:border-r-0 ${
                  getSlotClasses("").col
                }`}
                style={{
                  maxHeight: "calc(100vh - 200px)",
                  scrollbarGutter: "stable",
                }}
              >
                {/* Cabeçalho do dia */}
                <div className="h-[60px] flex flex-col items-center justify-center font-bold border-b border-gray-300 bg-gray-100 sticky top-0 z-10">
                  <div>{day}</div>
                  <div className="text-sm">
                    {date.toLocaleDateString("pt-BR", {
                      month: "numeric",
                      day: "numeric",
                    })}
                  </div>
                </div>

                {/* Slots de tempo */}
                {timeSlots.map((slot) => {
                  const classes = getSlotClasses(slot.period);
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
                      className={`h-16 border-b border-gray-300 ${
                        classes.slotCell
                      } ${
                        timeSlots.indexOf(slot) % 2 === 1 ? "bg-gray-50" : ""
                      }`}
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
