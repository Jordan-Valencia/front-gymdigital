import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "../../lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
}: StatsCardProps) {
  const colorVariants = {
    indigo: "from-indigo-50 to-white border-indigo-100 hover:border-indigo-300",
    emerald:
      "from-emerald-50 to-white border-emerald-100 hover:border-emerald-300",
    amber: "from-amber-50 to-white border-amber-100 hover:border-amber-300",
    violet: "from-violet-50 to-white border-violet-100 hover:border-violet-300",
    sky: "from-sky-50 to-white border-sky-100 hover:border-sky-300",
    rose: "from-rose-50 to-white border-rose-100 hover:border-rose-300",
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-b border rounded-xl p-4",
        "transition-all duration-300 group hover:shadow-lg hover:-translate-y-0.5",
        "animate-fadeIn backdrop-blur-sm",
        colorVariants[color as keyof typeof colorVariants],
      )}
    >
      <div className="flex items-center justify-between mb-2 relative z-10">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            "transition-transform group-hover:scale-110 duration-300",
            `bg-${color}-100 text-${color}-600`,
          )}
        >
          <Icon
            size={20}
            className="transition-transform group-hover:rotate-12"
          />
        </div>
        {trend && (
          <span
            className={cn(
              "text-xs font-semibold px-2 py-1 rounded-full transition-transform group-hover:scale-105",
              trend.isPositive
                ? "bg-emerald-100 text-emerald-800"
                : "bg-rose-100 text-rose-800",
            )}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}%
          </span>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-sm font-medium text-gray-600 mb-1 transition-colors group-hover:text-gray-800">
          {title}
        </h3>
        <p
          className={cn(
            "text-2xl font-bold tracking-tight",
            `text-${color}-700 group-hover:text-${color}-800`,
          )}
        >
          {value}
        </p>
      </div>

      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity",
          "group-hover:opacity-10",
          `from-${color}-400 to-transparent`,
        )}
      />
    </div>
  );
}
