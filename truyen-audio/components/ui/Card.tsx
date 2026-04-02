import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export default function Card({ title, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-lg border border-gray-200 bg-white p-6 shadow-sm", className)}
      {...props}
    >
      {title && <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>}
      {children}
    </div>
  );
}
