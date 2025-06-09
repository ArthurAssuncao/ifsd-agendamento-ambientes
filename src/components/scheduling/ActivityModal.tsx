import { useUserActivities } from "@/hooks/useUserActivities";
import Button from "@/ui/Button";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import { IoMdCloseCircleOutline } from "react-icons/io";

type ActivityModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (activity: string) => void;
  onRemove: () => void;
  currentActivity: string | null;
};

const ActivityModalIntern = ({
  isOpen,
  onClose,
  onSelect,
  onRemove,
  currentActivity,
}: ActivityModalProps) => {
  const { data: session } = useSession();
  const { activities, loading, error, addActivity } = useUserActivities();
  const [customActivity, setCustomActivity] = useState("");

  // Exemplo de uso real da sessão:
  const isAdmin = session?.user?.email?.endsWith("@admin.ifsudestemg.edu.br");

  if (!isOpen) return null;

  const handleActivitySelect = (activity: string) => {
    onSelect(activity);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/[0.4] backdrop-blur-xs flex items-center justify-center z-50"
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
            {activities.map((activity) => (
              <button
                key={activity}
                className={`w-full text-left p-2 rounded ${
                  currentActivity === activity
                    ? "bg-blue-100"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => handleActivitySelect(activity)}
              >
                {activity}
              </button>
            ))}
          </div>
        )}

        <div className=" flex mb-4">
          <div className="flex flex-1 flex-col items-start">
            <label className="block mb-2" htmlFor="custom-activity">
              Outra atividade:
            </label>
            <div className="flex w-full gap-2">
              <input
                id="custom-activity"
                placeholder="Digite uma nova atividade"
                type="text"
                className="w-full p-2 border rounded"
                value={customActivity}
                onChange={(e) => setCustomActivity(e.target.value)}
              />
              <Button
                className="min-w-2/10"
                onClick={() => {
                  if (customActivity.trim()) {
                    if (isAdmin) {
                      // Se for admin, adiciona à lista permanente
                      addActivity(customActivity);
                    }
                    handleActivitySelect(customActivity);
                  }
                }}
              >
                {isAdmin ? "Salvar e usar" : "Usar esta"}
              </Button>
            </div>
          </div>
        </div>

        {currentActivity && (
          <Button variant="danger" onClick={onRemove} className="mr-2">
            Remover Atividade da tabela
          </Button>
        )}

        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
      </div>
    </div>
  );
};

const ActivityModal = React.memo(ActivityModalIntern);

export { ActivityModal };
