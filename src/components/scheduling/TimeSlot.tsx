import { useSchedule } from "@/hooks/useSchedule";
import { DaysWeek, ScheduleSlot } from "@/types";
import { MouseEvent, useState } from "react";
import { ContextMenuData } from "../ContextMenu.jsx/ContextMenu.jsx";
import { ActivityModal } from "./ActivityModal";

type TimeSlotProps = {
  day: string;
  time: string;
  labId: string;
  week: number;
  className?: string;
  setContextMenu: (data: ContextMenuData | null) => void;
};

export function TimeSlot({
  day,
  time,
  labId,
  week,
  className,
  setContextMenu,
}: TimeSlotProps) {
  const { schedule, updateSlot } = useSchedule();
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);

  const slotData = schedule?.[week]?.[labId]?.[day]?.[time] as
    | ScheduleSlot
    | undefined;

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

  return (
    <>
      <div
        className={`p-4 cursor-pointer ${
          slotData ? "bg-green-100" : "hover:bg-gray-50"
        } ${className}`}
        onClick={handleSlotClick}
        onContextMenu={(e) =>
          handleContextMenu(e, week, labId, day as DaysWeek, time)
        }
      >
        {slotData && (
          <div className="text-sm flex flex-col gap-2">
            <span className="line-clamp-2">Atividade: {slotData.activity}</span>
            {slotData.user && (
              <span className="block text-green-800 truncate">
                Reserva para {slotData.user.name}
              </span>
            )}
            <span className="block text-gray-500 truncate">
              Reservado em{" "}
              {new Date(slotData.bookingTime).toLocaleDateString("pt-br", {
                day: "numeric",
                month: "numeric",
              })}
            </span>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ActivityModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSelect={handleActivitySelect}
          currentActivity={slotData?.activity || null}
          onRemove={() => {
            updateSlot(week, labId, day as DaysWeek, time);
            setIsModalOpen(false);
          }}
        />
      )}
    </>
  );
}
