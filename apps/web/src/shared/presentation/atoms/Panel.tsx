import type { HTMLAttributes, ReactNode } from "react";

/** Cam efektli kart/panel kutusu. */
export function Panel({ className = "", ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`panel p-4 ${className}`} {...rest} />;
}

export function PanelTitle({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <h3 className={`mb-2 font-display text-base font-semibold text-white ${className}`}>{children}</h3>;
}
