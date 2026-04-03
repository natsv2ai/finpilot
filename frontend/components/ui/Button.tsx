import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
}

export default function Button({
  variant = "primary",
  children,
  ...props
}: ButtonProps) {
  const base = "px-4 py-2 rounded-md font-medium";

  const styles =
    variant === "primary"
      ? "bg-black text-white"
      : "bg-gray-200 text-black";

  return (
    <button className={`${base} ${styles}`} {...props}>
      {children}
    </button>
  );
}