import { useEmailColors } from "@/hooks/useEmailColors";
import { useSchedule } from "@/hooks/useSchedule";
import { NUMBER_DAYS_OF_WORK_WEEK } from "@/lib/constants";
import {
  DAYS_OF_WEEK_TO_ENGLISH,
  daysOfWeekPtBr,
  getDateAddedDays,
  getDateFromWeek,
  getNextTime,
  timeSlots,
} from "@/lib/utils";
import { DaysWeek, ScheduleSlot } from "@/types";
import { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useMediaQuery } from "react-responsive";
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
  const { schedule, updateSlot } = useSchedule(false);
  const columnRefs = useRef<(HTMLDivElement | null)[]>([]);
  const isUserScroll = useRef(true);
  const { getEmailColor } = useEmailColors();
  const isMobile = useMediaQuery({ maxWidth: 768 });
  const [visibleColumn, setVisibleColumn] = useState(1);

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

  const isEqualSlot = (a?: ScheduleSlot, b?: ScheduleSlot) => {
    if (!a || !b) return false;
    return a.activity === b.activity && a.user?.email === b.user?.email;
  };

  const getSlotGroups = (day: DaysWeek) => {
    const groups: { start: number; end: number }[] = [];
    let currentGroupStart = 0;

    for (let i = 1; i < timeSlots.length; i++) {
      const current = schedule?.[week]?.[labId]?.[day]?.[timeSlots[i].time];
      const prev = schedule?.[week]?.[labId]?.[day]?.[timeSlots[i - 1].time];

      if (!isEqualSlot(current, prev)) {
        groups.push({
          start: currentGroupStart,
          end: i - 1,
        });
        currentGroupStart = i;
      }
    }

    // Adiciona o último grupo
    groups.push({
      start: currentGroupStart,
      end: timeSlots.length - 1,
    });

    return groups;
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleRemoveActivity = () => {
    if (!contextMenu) return;

    const { labId, week, time, day } = contextMenu;
    updateSlot(week, labId, day as DaysWeek, time);
    closeContextMenu();
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Removed activity for ${day} at ${time} in lab ${labId} for week ${week}`
      );
    }
  };

  const contextActions = [
    {
      label: "Remover",
      handler: handleRemoveActivity,
    },
  ];

  const nextDayToShow = () => {
    setVisibleColumn((prev) => {
      const newValue = (prev + 1) % NUMBER_DAYS_OF_WORK_WEEK;

      if (newValue > 0) {
        return newValue;
      }
      return 6;
    });
  };

  const prevDayToShow = () => {
    setVisibleColumn((prev) => {
      const newValue = (prev - 1) % NUMBER_DAYS_OF_WORK_WEEK;

      if (newValue > 0) {
        return newValue;
      }
      return 6;
    });
  };

  return (
    <div className="min-w-full overflow-x-auto mt-4 bg-white rounded-lg shadow-lg ">
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
          <div className="h-16 flex items-center justify-center font-bold border-b border-gray-300 bg-gray-100 sticky top-0 z-10">
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
        <div className="flex flex-1">
          {daysOfWeekPtBr.map((day, dayIndex) => {
            const date = getDateAddedDays(getDateFromWeek(week), dayIndex);
            const dayKey = DAYS_OF_WEEK_TO_ENGLISH[day] as DaysWeek;
            const slotGroups = getSlotGroups(dayKey);

            return (
              <div
                key={day}
                ref={(el: HTMLDivElement | null) => {
                  columnRefs.current[dayIndex + 1] = el;
                }}
                className={`${
                  isMobile && dayIndex + 1 != visibleColumn && "hidden"
                } overscroll-auto scrollbar-none overflow-y-scroll flex-1 lg:min-w-36 border-r border-gray-300 last:border-r-0 ${
                  getSlotClasses("").col
                }`}
                style={{
                  maxHeight: "calc(100vh - 200px)",
                  scrollbarGutter: "stable",
                }}
              >
                {/* Cabeçalho do dia */}
                <div className="h-16 flex flex-col items-center justify-center font-bold border-b border-gray-300 bg-gray-100 sticky top-0 z-10">
                  <div className="flex p-2 w-full lg:w-auto justify-between content-center">
                    {isMobile && (
                      <button onClick={prevDayToShow}>
                        <FaChevronLeft
                          size={36}
                          className="hover:text-green-700 hover:cursor-pointer transition-colors"
                        />
                      </button>
                    )}
                    <div className="flex flex-col w-full">
                      <span>{day}</span>
                      <div className="text-sm">
                        {date.toLocaleDateString("pt-BR", {
                          month: "numeric",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                    {isMobile && (
                      <button onClick={nextDayToShow}>
                        <FaChevronRight
                          size={36}
                          className="hover:text-green-700 hover:cursor-pointer transition-colors"
                        />
                      </button>
                    )}
                  </div>
                </div>

                {/* Slots de tempo */}
                {slotGroups.map((group) => {
                  const slot = timeSlots[group.start];
                  const scheduleSlot =
                    schedule?.[week]?.[labId]?.[dayKey]?.[slot.time];
                  const groupHeight = group.end - group.start + 1;
                  const classes = getSlotClasses(slot.period);
                  const disabled = slot.period.includes("break");

                  return (
                    <TimeSlot
                      key={`${day}-${group.start}`}
                      day={day}
                      time={slot.time}
                      labId={labId}
                      week={week}
                      className={`${disabled && "border-transparent"} ${
                        classes.slotCell
                      } ${group.start % 2 === 1 ? "bg-gray-50" : ""}`}
                      setContextMenu={setContextMenu}
                      scheduleSlot={scheduleSlot}
                      updateSlot={updateSlot}
                      disabled={disabled}
                      mergeTop={scheduleSlot && group.start > 0}
                      mergeBottom={
                        scheduleSlot && group.end < timeSlots.length - 1
                      }
                      groupHeight={groupHeight}
                      isFirstInGroup={true}
                      isLastInGroup={true}
                      getEmailColor={getEmailColor}
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
