"lucide-react";
import { cn } from "../../lib/utils";
import { LucideIcon } from "lucide-react";

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
    indigo: "from-indigo-50 to-white border-indigo-100 hover:border-indigo-300 dark:from-gray-800/80 dark:to-gray-800/50 dark:border-indigo-900/50 dark:hover:border-indigo-700",
    emerald:
      "from-emerald-50 to-white border-emerald-100 hover:border-emerald-300 dark:from-gray-800/80 dark:to-gray-800/50 dark:border-emerald-900/50 dark:hover:border-emerald-700",
    amber: "from-amber-50 to-white border-amber-100 hover:border-amber-300 dark:from-gray-800/80 dark:to-gray-800/50 dark:border-amber-900/50 dark:hover:border-amber-700",
    violet: "from-violet-50 to-white border-violet-100 hover:border-violet-300 dark:from-gray-800/80 dark:to-gray-800/50 dark:border-violet-900/50 dark:hover:border-violet-700",
    sky: "from-sky-50 to-white border-sky-100 hover:border-sky-300 dark:from-gray-800/80 dark:to-gray-800/50 dark:border-sky-900/50 dark:hover:border-sky-700",
    rose: "from-rose-50 to-white border-rose-100 hover:border-rose-300 dark:from-gray-800/80 dark:to-gray-800/50 dark:border-rose-900/50 dark:hover:border-rose-700",
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
            `bg-${color}-100 text-${color}-600 dark:bg-${color}-900/50 dark:text-${color}-400`,
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
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                : "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300",
            )}
          >
            {trend.isPositive ? "↑" : "↓"} {trend.value}%
          </span>
        )}
      </div>

      <div className="relative z-10">
        <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 transition-colors group-hover:text-gray-800 dark:group-hover:text-gray-200">
          {title}
        </h3>
        <p
          className={cn(
            "text-2xl font-bold tracking-tight",
            `text-${color}-700 group-hover:text-${color}-800 dark:text-${color}-400 dark:group-hover:text-${color}-300`,
          )}
        >
          {value}
        </p>
      </div>

      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity",
          "group-hover:opacity-10 dark:group-hover:opacity-20",
          `from-${color}-400 to-transparent`,
        )}
      />
    </div>
  );
}

