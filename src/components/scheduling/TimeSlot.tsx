import {
  COLOR_DISABLED_SLOT,
  EMAIL_SCHEDULE_COMISSION,
  MINUTES_PER_SLOT,
} from "@/lib/constants";
import { DAYS_OF_WEEK_TO_ENGLISH, getNextTime } from "@/lib/utils";
import { DaysWeek, ScheduleSlot } from "@/types";
import { UpdateSlotFunction } from "@/types/useSchedule";
import { isEqual } from "lodash";
import { useSession } from "next-auth/react";
import React, { MouseEvent, useRef, useState } from "react";
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
  mergeTop?: boolean;
  mergeBottom?: boolean;
  groupHeight?: number;
  isFirstInGroup?: boolean;
  isLastInGroup?: boolean;
  getEmailColor: (email: string | undefined | null) => string;
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
    mergeTop = false,
    mergeBottom = false,
    groupHeight = 1,
    isFirstInGroup = true,
    isLastInGroup = true,
    getEmailColor,
  }: TimeSlotProps) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: session } = useSession();
    const elementRef = useRef<HTMLDivElement>(null);
    const [currentTime, setCurrentTime] = useState(time);

    const [isHovered, setIsHovered] = useState(false);
    const slotId = `${labId}-${DAYS_OF_WEEK_TO_ENGLISH[day]}-${time}`
      .replace(":", "-")
      .toLocaleLowerCase();
    const slotHeight = 64;

    const getSlotPosition = (event: React.MouseEvent<HTMLDivElement>) => {
      const slotElement = elementRef.current;
      if (!slotElement) return { x: 0, y: 0 };
      const rect = slotElement.getBoundingClientRect();
      const x = event.clientX - rect.left; // Posição X relativa
      const y = event.clientY - rect.top; // Posição Y relativa
      return { x, y };
    };

    const handleSlotClick = (event: React.MouseEvent<HTMLDivElement>) => {
      const slotPosition = getSlotPosition(event);
      if (groupHeight > 1) {
        const slotsAfter = Math.floor(slotPosition.y / slotHeight);
        console.log("Slots after", slotsAfter);

        const newTime = getNextTime(time, slotsAfter);
        setCurrentTime(newTime);
      } else {
        setCurrentTime(time);
      }

      if (process.env.NODE_ENV === "development") {
        console.log("click in position", slotPosition);
      }

      setIsModalOpen(true);
    };

    const handleActivitySelect = (activity: string, details?: string) => {
      updateSlot(week, labId, day as DaysWeek, currentTime, activity, details);
      setIsModalOpen(false);
    };

    const handleContextMenu = (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      const slotPosition = getSlotPosition(e);
      let newTime = time;
      if (groupHeight > 1) {
        const slotsAfter = Math.floor(slotPosition.y / slotHeight);
        console.log("Slots after", slotsAfter);

        newTime = getNextTime(time, slotsAfter);
        setCurrentTime(newTime);
      } else {
        setCurrentTime(time);
      }

      if (process.env.NODE_ENV === "development") {
        console.log("Schedule slot context menu clicked", scheduleSlot);
      }

      if (process.env.NODE_ENV === "development") {
        console.log(
          "data",
          scheduleSlot,
          day,
          newTime,
          labId,
          week,
          groupHeight,
          slotId
        );
      }

      e.preventDefault();
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        week,
        labId,
        day: day as DaysWeek,
        time: newTime,
      });
    };

    const hasChangeEvent = () => {
      return (
        (!disabled && !scheduleSlot) ||
        scheduleSlot?.user?.email === session?.user.email
      );
    };

    const handleSyncError = (e: MouseEvent<HTMLSpanElement>) => {
      e.stopPropagation();
      toast("Sincronização falhou. Por favor, tente novamente.", {
        type: "error",
      });
    };

    const calculateColor = () => {
      if (!scheduleSlot) return "#f9fafb";
      return scheduleSlot.user?.email &&
        scheduleSlot.user?.email !== EMAIL_SCHEDULE_COMISSION
        ? `${getEmailColor(scheduleSlot.user?.email).toLowerCase()}`
        : "#f3f4f6";
    };

    const colorSlot = calculateColor();
    const showContent = isFirstInGroup || groupHeight === 1;
    const minutesGroupSlots = groupHeight * MINUTES_PER_SLOT;
    const backgroundColor =
      isHovered && !disabled
        ? "#dcfce7"
        : disabled
        ? COLOR_DISABLED_SLOT
        : colorSlot;

    let scheduleSlotClass;
    let scheduleSlotTeacher;
    if (
      scheduleSlot?.details &&
      scheduleSlot?.user?.email === EMAIL_SCHEDULE_COMISSION
    ) {
      const scheduleSlotDetailsParts = scheduleSlot.details
        .replace(" (", ";")
        .replace(")", "")
        .split(";");
      if (scheduleSlotDetailsParts.length >= 2) {
        scheduleSlotClass = scheduleSlotDetailsParts[0]?.trim();
        scheduleSlotTeacher = scheduleSlotDetailsParts[1]?.trim();
      }
    }

    return (
      <>
        <div
          id={slotId}
          ref={elementRef}
          data-disabled={disabled}
          className={`flex relative transition-colors duration-200 select-none ${
            mergeTop && !isFirstInGroup
              ? "border border-transparent"
              : "border-t border-gray-200"
          } ${
            mergeBottom && !isLastInGroup
              ? "border border-transparent"
              : "border-b border-gray-200"
          } 
          
          ${className}`}
          style={{
            height: `${groupHeight * slotHeight}px`,
            backgroundColor: backgroundColor,
            zIndex: isHovered ? 10 : 1,
            cursor: !hasChangeEvent() ? "not-allowed" : "pointer",
            pointerEvents: disabled ? "none" : "auto",
            opacity: disabled ? 0.5 : 1,
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={hasChangeEvent() ? handleSlotClick : () => {}}
          onContextMenu={hasChangeEvent() ? handleContextMenu : () => {}}
        >
          {scheduleSlot && showContent && (
            <div
              className={`absolute inset-0 p-${
                groupHeight == 1 ? "1" : "2"
              } flex flex-col justify-around select-none`}
            >
              <div
                className={`flex flex-col ${
                  groupHeight > 1 ? "gap-2" : ""
                } m-auto`}
              >
                <div
                  className={`text-sm ${
                    groupHeight > 1
                      ? "line-clamp-2"
                      : "line-clamp-1 text-ellipsis"
                  }`}
                >
                  {scheduleSlot.activity}
                </div>

                {scheduleSlot.details && (
                  <div
                    className={`text-xs ${
                      groupHeight > 1
                        ? "line-clamp-2"
                        : "line-clamp-1 text-ellipsis"
                    }`}
                  >
                    {scheduleSlot.user?.email !== EMAIL_SCHEDULE_COMISSION ? (
                      scheduleSlot.details
                    ) : (
                      <>
                        <span className="flex justify-center">
                          {scheduleSlotClass}
                        </span>
                        <span className="flex justify-center">
                          {scheduleSlotTeacher}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>

              {scheduleSlot.user?.email !== EMAIL_SCHEDULE_COMISSION && (
                <div className="text-xs text-green-800 truncate">
                  {scheduleSlot.user?.name}
                  {groupHeight == 1 && (
                    <span className="text-xs text-gray-500 mt-1 justify-end">
                      {" "}
                      {new Date(scheduleSlot.bookingTime).toLocaleDateString(
                        "pt-br",
                        {
                          day: "numeric",
                          month: "numeric",
                        }
                      )}
                    </span>
                  )}
                </div>
              )}

              {scheduleSlot.user.email !== EMAIL_SCHEDULE_COMISSION &&
                scheduleSlot.bookingTime &&
                groupHeight > 1 && (
                  <div className="text-xs text-gray-500 mt-1 mb-1 justify-end content-end mr-8 ml-8">
                    Reservado em{" "}
                    {new Date(scheduleSlot.bookingTime).toLocaleDateString(
                      "pt-br",
                      {
                        day: "numeric",
                        month: "numeric",
                      }
                    )}
                  </div>
                )}

              {!scheduleSlot.dbSynced && (
                <div
                  className="absolute top-1 right-1 text-red-600 hover:text-red-800"
                  onClick={handleSyncError}
                >
                  <MdSyncProblem size={18} />
                </div>
              )}

              {groupHeight > 1 && isLastInGroup && (
                <div className="absolute bottom-0 right-1 text-xs text-gray-400">
                  {`${
                    minutesGroupSlots >= 60
                      ? Math.floor(minutesGroupSlots / 60) + "h"
                      : ""
                  }${minutesGroupSlots % 60}min`}
                </div>
              )}
            </div>
          )}

          {isHovered && (
            <div
              className={`absolute top-[0] right-0 text-[0.7rem] text-white bg-gray-800 overflow-visible rounded p-1 pl-2 pr-2 z-10 opacity-95`}
            >
              <span className="flex justify-center">{day}</span>
              <span className="flex justify-center">
                {time} {`a ${getNextTime(time, groupHeight)}`}
              </span>
            </div>
          )}

          {isHovered && !disabled && (
            <div className="absolute inset-0 border-2 border-blue-400 pointer-events-none" />
          )}
        </div>

        {isModalOpen && (
          <ActivityModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSelect={handleActivitySelect}
            currentActivity={scheduleSlot?.activity || null}
            currentDetails={scheduleSlot?.details || null}
            onRemove={() => {
              updateSlot(week, labId, day as DaysWeek, currentTime);
              setIsModalOpen(false);
            }}
            day={day}
            time={currentTime}
            grouped={groupHeight > 1}
          />
        )}
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      (prevProps.scheduleSlot == undefined &&
        nextProps.scheduleSlot == undefined &&
        prevProps.day === nextProps.day &&
        prevProps.time === nextProps.time &&
        prevProps.labId === nextProps.labId &&
        prevProps.week === nextProps.week) ||
      (prevProps.day === nextProps.day &&
        prevProps.time === nextProps.time &&
        prevProps.labId === nextProps.labId &&
        prevProps.week === nextProps.week &&
        prevProps.mergeTop === nextProps.mergeTop &&
        prevProps.mergeBottom === nextProps.mergeBottom &&
        prevProps.groupHeight === nextProps.groupHeight &&
        isEqual(prevProps.scheduleSlot, nextProps.scheduleSlot))
    );
  }
);

TimeSlot.displayName = "TimeSlot";
