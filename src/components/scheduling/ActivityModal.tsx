import { useUserActivities } from "@/hooks/useUserActivities";
import Button from "@/ui/Button";
import { RadioGroup } from "@/ui/RadioGroup";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";

type ActivityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (activity: string, details?: string) => void;
  onRemove: () => void;
  currentActivity: string | null;
  currentDetails: string | null;
  day: string;
  time: string;
  grouped: boolean;
};

type ActivityOption = {
  value: string;
  label: string;
};

const ActivityModalIntern = ({
  isOpen,
  onClose,
  onSelect,
  onRemove,
  currentActivity,
  currentDetails,
  day,
  time,
  grouped,
}: ActivityModalProps) => {
  const { data: session } = useSession();
  const { activities, loading, error } = useUserActivities();
  const [detailsActivity, setDetailsActivity] = useState<string>(
    currentDetails ? currentDetails : ""
  );
  const [activitySelected, setActivitySelected] = useState<string>(
    currentActivity ? currentActivity : ""
  );

  if (!isOpen) return null;

  const handleActivitySelect = () => {
    if (activitySelected) {
      onSelect(
        activitySelected,
        detailsActivity == "" ? undefined : detailsActivity
      );
    }
    onClose();
  };

  const activitiesOptions: ActivityOption[] = activities.flatMap(
    (activity: string) => {
      return [
        {
          value: activity.toLocaleLowerCase().replace(" ", "_"),
          label: activity,
        },
      ];
    }
  );

  const currentActivitySelected = activitiesOptions.find(
    (value: ActivityOption) => {
      return currentActivity ? value.label == currentActivity : "";
    }
  );

  const handleChange = (valueSelected: string) => {
    const newActivitySelected = activitiesOptions.find(
      (value: ActivityOption) => {
        return value.value == valueSelected;
      }
    );
    if (newActivitySelected) {
      setActivitySelected(newActivitySelected?.label);
    }
  };

  return (
    <div
      className="p-2 fixed inset-0 bg-black/[0.4] backdrop-blur-xs flex items-center justify-center z-50 shadow"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg w-xl shadow"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4 relative">
          Selecionar Atividade
          {session?.user?.name && (
            <span className="block text-sm font-normal">
              Para: {session.user.name}
            </span>
          )}
          <span className="flex mt-2 text-sm font-normal text-gray-700">
            {currentActivity && `Atual: ${currentActivity}`}
          </span>
          <span
            className={`flex text-sm font-normal text-gray-700 ${
              grouped && "text-red-700"
            }`}
          >
            {day && time && `Horário: ${day} ${time}`}
          </span>
          <Button
            className="absolute top-[-8] right-[-8]"
            onClick={onClose}
            variant="transparentCircle"
          >
            <IoMdCloseCircleOutline
              size={42}
              className="text-gray-400 hover:text-black cursor-pointer transition-colors"
            />
          </Button>
        </h2>

        {loading ? (
          <div>Carregando atividades...</div>
        ) : error ? (
          <div className="text-red-500 mb-4">{error}</div>
        ) : (
          <div className="space-y-2 mb-4">
            {activities && (
              <RadioGroup
                options={activitiesOptions}
                name="options"
                onChange={handleChange}
                defaultValue={currentActivitySelected?.value}
              />
            )}
          </div>
        )}

        <div className=" flex mb-4">
          <div className="flex flex-1 flex-col items-start">
            <label className="block mb-2" htmlFor="details-activity">
              Descreva a atividade (opcional):
            </label>
            <div className="flex w-full gap-2">
              <input
                id="details-activity"
                placeholder="Indique a turma, projeto ou outra informação que preferir"
                type="text"
                className="w-full px-4 py-2 rounded-lg border-2 border-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-200 focus:outline-none transition-colors"
                value={detailsActivity}
                onChange={(e) => setDetailsActivity(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-4 flex-wrap">
          {currentActivity && (
            <Button variant="danger" onClick={onRemove}>
              Remover Atividade da tabela
            </Button>
          )}

          <Button variant="secondary" onClick={onClose}>
            Fechar
          </Button>

          <Button
            className="min-w-2/10"
            onClick={() => {
              if (activitySelected) {
                handleActivitySelect();
              }
            }}
            disabled={!activitySelected}
          >
            Marcar
          </Button>
        </div>
      </div>
    </div>
  );
};

const ActivityModal = React.memo(ActivityModalIntern);

export { ActivityModal };
