import React from "react";

interface ButtonProps {
  variant: "primary" | "text" | "outline" | "icon" | "secondary";
  children?: React.ReactNode;
  label?: string;
  icon?: string;
  className?: string;
  onClick?: (event: React.SyntheticEvent) => void;
}

export function Button({ variant, children, label, onClick }: ButtonProps) {
  console.assert(
    label !== undefined || children !== undefined,
    "Either label or children must be passed"
  );

  if (variant === "icon") {
    return (
      <button
        className="p-2 rounded-full hover:bg-blue-50 transition-colors"
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  if (variant === "primary") {
    return (
      <button
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  if (variant === "outline") {
    return (
      <button
        className="flex font-bold items-center gap-2 px-4 py-2 text-blue-700 rounded-lg border-2 "
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  if (variant === "text") {
    return (
      <button
        className="flex font-bold items-center gap-2 px-4 py-2 text-blue-700"
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  if (variant === "secondary") {
    return (
      <button
        className="flex items-center gap-2 px-4 py-2 bg-white-600 text-black rounded-lg shadow-md hover:shadow-lg"
        onClick={onClick}
      >
        {children}
      </button>
    );
  }

  return null;
}
