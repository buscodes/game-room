import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost";
type Size = "sm" | "md" | "lg";

const SIZE: Record<Size, string> = { sm: "px-3 py-1.5 text-xs", md: "", lg: "text-lg" };

export function Button({
  variant = "ghost",
  size = "md",
  className = "",
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={`btn btn-${variant} ${SIZE[size]} ${className}`} {...rest} />;
}
