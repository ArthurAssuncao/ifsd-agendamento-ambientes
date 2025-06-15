import { ReactNode } from "react";

type ButtonProps = {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?:
    | "primary"
    | "secondary"
    | "danger"
    | "transparent"
    | "transparentCircle";
  className?: string;
  disabled?: boolean;
};

export default function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  className = "",
  disabled = false,
}: ButtonProps) {
  const baseClasses =
    "font-medium transition-colors hover:cursor-pointer select-none";

  const variantClasses = {
    primary: "px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700",
    secondary:
      "px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700",
    transparent: "px-0 py-0 rounded-none",
    transparentCircle: "px-0 py-0 rounded-full",
  };

  return (
    <button
      type={type}
      onClick={!disabled ? onClick : () => {}}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${className} ${
        disabled && "pointer-events-none bg-gray-400"
      }`}
    >
      {children}
    </button>
  );
}
