import { DAYS_OF_WEEK_TO_ENGLISH } from "@/lib/utils";
import { DaysWeek, ScheduleSlot, YearSchedule } from "@/types";
import { UpdateSlotFunction } from "@/types/useSchedule.js";
import { MouseEvent, useState } from "react";
import { MdSyncProblem } from "react-icons/md";
import { toast } from "react-toastify";
import { ContextMenuData } from "../ContextMenu.jsx/ContextMenu.jsx";
import { ActivityModal } from "./ActivityModal";

type TimeSlotProps = {
  day: string;
  time: string;
  labId: string;
  week: number;
  className?: string;
  setContextMenu: (data: ContextMenuData | null) => void;
  schedule: YearSchedule | null;
  updateSlot: UpdateSlotFunction;
};

export function TimeSlot({
  day,
  time,
  labId,
  week,
  className,
  setContextMenu,
  schedule,
  updateSlot,
}: TimeSlotProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  // const [contextMenu, setContextMenu] = useState<ContextMenuData | null>(null);

  const slotData = schedule?.[week]?.[labId]?.[DAYS_OF_WEEK_TO_ENGLISH[day]]?.[
    time
  ] as ScheduleSlot | undefined;

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
          <div className="text-sm flex flex-col gap-2 relative">
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
            {slotData.details && (
              <span className="text-xs text-gray-600">
                Detalhes: {slotData.details}
              </span>
            )}
            {!slotData.dbSynced && (
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
