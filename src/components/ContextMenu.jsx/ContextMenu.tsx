import { useClickOutside } from "@/hooks/useClickOutside";
import { useEffect, useRef, useState } from "react";

export type ContextMenuProps = {
  x: number;
  y: number;
  onClose: () => void;
  actions: Array<{
    label: string;
    handler: () => void;
  }>;
};

export type ContextMenuData = {
  x: number;
  y: number;
  week: number;
  labId: string;
  day: string;
  time: string;
};

export const ContextMenu = ({ x, y, onClose, actions }: ContextMenuProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const ref = useRef<HTMLDivElement>(null);

  const onClickOutsidec = () => {
    onClose();
  };

  useClickOutside(ref, onClickOutsidec);

  useEffect(() => {
    // Ajustar posição para não sair da tela
    const menuWidth = 200;
    const menuHeight = 120;
    const xPos =
      x + menuWidth > window.innerWidth ? window.innerWidth - menuWidth : x;
    const yPos =
      y + menuHeight > window.innerHeight ? window.innerHeight - menuHeight : y;

    setPosition({ x: xPos, y: yPos });
  }, [x, y]);

  return (
    <div
      className="fixed bg-white shadow-lg rounded-md border border-gray-200 z-50 w-48"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onClick={(e) => e.stopPropagation()}
      ref={ref}
    >
      <ul className="py-1">
        {actions.map((action, index) => (
          <li key={index}>
            <button
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
              onClick={(e) => {
                e.stopPropagation();
                action.handler();
                onClose();
              }}
            >
              {action.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
