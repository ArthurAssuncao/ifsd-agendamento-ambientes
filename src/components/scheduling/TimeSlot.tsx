import { useEmailColors } from "@/hooks/useEmailColors";
import { EMAIL_SCHEDULE_COMISSION } from "@/lib/constants";
import { DaysWeek, ScheduleSlot } from "@/types";
import { UpdateSlotFunction } from "@/types/useSchedule";
import { isEqual } from "lodash";
import React, { MouseEvent, useState } from "react";
import { MdSyncProblem } from "react-icons/md";
import { toast } from "react-toastify";
import { ContextMenuData } from "../ContextMenu";
import { ActivityModal } from "./ActivityModal";

type TimeSlotProps = {
  day: string;
  time: string;
  labId: string;
  week: number;
  className?: string;
  setContextMenu: (data: ContextMenuData | null) => void;
  scheduleSlot?: ScheduleSlot;
  updateSlot: UpdateSlotFunction;
  disabled: boolean;
};

export const TimeSlot = React.memo(
  ({
    day,
    time,
    labId,
    week,
    className,
    setContextMenu,
    scheduleSlot,
    updateSlot,
    disabled,
  }: TimeSlotProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { getEmailColor } = useEmailColors();
    const [isHovered, setIsHovered] = useState(false);
    // const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);

    const handleSlotClick = () => {
      setIsModalOpen(true);
    };

    const handleActivitySelect = (activity: string) => {
      updateSlot(week, labId, day as DaysWeek, time, activity);
      setIsModalOpen(false);
    };

    const handleContextMenu = (
      e: MouseEvent<HTMLDivElement>,
      week: number,
      labId: string,

      day: DaysWeek,
      time: string
    ) => {
      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        week,
        labId,
        day,
        time,
      });
    };

    const handleSyncError = (e: MouseEvent<HTMLSpanElement>) => {
      e.stopPropagation();
      // Aqui você pode implementar a lógica para lidar com o erro de sincronização
      toast("Sincronização falhou. Por favor, tente novamente.", {
        type: "error",
      });
    };

    let colorSlot = "#f9fafb";
    if (scheduleSlot) {
      colorSlot =
        scheduleSlot?.user?.email != EMAIL_SCHEDULE_COMISSION
          ? `${getEmailColor(scheduleSlot?.user?.email).toLowerCase()}`
          : "#f3f4f6";
    }

    return (
      <>
        <div
          className={`p-4 ${
            scheduleSlot ? `bg-[${colorSlot}]` : `bg-[${colorSlot}]`
          } ${
            !disabled ? `cursor-pointer hover:bg-green-100` : ``
          }  ${className}`}
          style={
            !disabled && !isHovered
              ? {
                  backgroundColor: colorSlot,
                  transition: "background-color 0.3s",
                }
              : { backgroundColor: ` ${!disabled ? "#dcfce7" : "#99a1af"}` }
          }
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={
            !disabled && scheduleSlot?.user?.email != EMAIL_SCHEDULE_COMISSION
              ? handleSlotClick
              : () => {}
          }
          onContextMenu={
            !disabled && scheduleSlot?.user?.email != EMAIL_SCHEDULE_COMISSION
              ? (e) => handleContextMenu(e, week, labId, day as DaysWeek, time)
              : () => {}
          }
        >
          {scheduleSlot && (
            <div className="text-sm flex flex-col gap-2 relative h-full justify-between select-none">
              <span className="line-clamp-2">{scheduleSlot.activity}</span>
              {scheduleSlot.user &&
                scheduleSlot.user.email != EMAIL_SCHEDULE_COMISSION && (
                  <span className="block text-green-800 truncate text-xs">
                    Reserva para {scheduleSlot.user.name}
                  </span>
                )}
              {scheduleSlot.user.email != EMAIL_SCHEDULE_COMISSION && (
                <span className="block text-gray-500 truncate text-xs">
                  Reservado em{" "}
                  {new Date(scheduleSlot.bookingTime).toLocaleDateString(
                    "pt-br",
                    {
                      day: "numeric",
                      month: "numeric",
                    }
                  )}
                </span>
              )}
              {scheduleSlot.details && (
                <span className="text-xs text-gray-600">
                  {scheduleSlot.details}
                </span>
              )}
              {!scheduleSlot.dbSynced && (
                <span
                  className="text-xs text-red-600 absolute top-[-8] right-[-8] hover:text-red-800 transition"
                  onClick={handleSyncError}
                >
                  <span className="sr-only">Erro de sincronização</span>
                  <MdSyncProblem size={24} />
                </span>
              )}
            </div>
          )}
        </div>

        {isModalOpen && (
          <ActivityModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSelect={handleActivitySelect}
            currentActivity={scheduleSlot?.activity || null}
            onRemove={() => {
              updateSlot(week, labId, day as DaysWeek, time);
              setIsModalOpen(false);
            }}
          />
        )}
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      (prevProps.scheduleSlot == undefined &&
        nextProps.scheduleSlot == undefined) ||
      (prevProps.day === nextProps.day &&
        prevProps.time === nextProps.time &&
        prevProps.labId === nextProps.labId &&
        prevProps.week === nextProps.week &&
        isEqual(prevProps.scheduleSlot, nextProps.scheduleSlot))
    );
  }
);

TimeSlot.displayName = "TimeSlot"; // Necessário para React.memo
