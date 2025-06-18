import { useRef, useState } from "react";

export const useRelativeClickPosition = () => {
  const elementRef = useRef<HTMLDivElement>(null);
  const [relativePosition, setRelativePosition] = useState({ x: 0, y: 0 });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (elementRef.current) {
      const rect = elementRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left; // Posição X relativa
      const y = event.clientY - rect.top; // Posição Y relativa
      setRelativePosition({ x, y });
    }
  };

  return { elementRef, relativePosition, handleClick };
};
