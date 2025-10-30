import { Award, Calendar, Flame, Zap } from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSupabase } from "~/components/internal/supabaseAuth";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import type { UserStatsProps } from "~/types/table.types";

function UserStats() {
  const [stats, setStats] = useState<UserStatsProps | null>(null);
  const { t } = useTranslation("dashboard");

  const [isLoading, setIsLoading] = useState(true);
  const isLoadingRef = useRef(false);
  const supabase = useSupabase();

  useEffect(() => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    supabase
      .from("user_levels")
      .select("*")
      .maybeSingle()
      .then(({ data, error }) => {
        isLoadingRef.current = false;
        setIsLoading(false);

        if (error) {
          console.error("Error fetching user stats:", error);
          return;
        }

        setStats(data);
      });
  }, [supabase]);

  if (isLoading) {
    return <Skeleton className="h-48 w-full mb-4" />;
  }

  return (
    <div>
      <h2 className={cn("text-xl font-semibold mb-4")}>{t("stats.title")}</h2>

      {!stats?.longest_streak ? (
        <NoStreakWarning />
      ) : (
        <StatsInfoBox stats={stats} />
      )}
    </div>
  );
}

export default UserStats;

const NoStreakWarning = () => {
  const { t } = useTranslation("dashboard");

  return <div className={cn("pb-8")}>{t("stats.no_streak_warning")}</div>;
};

const StatsInfoBox = ({ stats }: { stats: UserStatsProps }) => {
  const { t } = useTranslation("dashboard");
  const isCurrentStreakTheLongest = useMemo(
    () => stats.current_streak === stats.longest_streak,
    [stats.current_streak, stats.longest_streak]
  );

  const nextLevelXp = useMemo(() => {
    const nextLevelXp = 50 * (stats.level + 1) * stats.level;
    const xpToNext = nextLevelXp;
    return Math.max(xpToNext, 0); // avoids negatives
  }, [stats.level]);

  const progressNextLevel = useMemo(
    () => nextLevelXp - stats.xp,
    [nextLevelXp, stats.xp]
  );

  const lastDay = useMemo(() => {
    return new Date(stats.last_activity_date!).toLocaleDateString();
  }, [stats.last_activity_date]);

  return (
    <div className={cn("px-4 mb-4", "flex flex-col gap-2 items-center w-full")}>
      <div
        className={cn(
          "relative",
          "w-full h-6 bg-gray-200 rounded-md overflow-hidden",
          "max-w-2xl"
        )}
      >
        <div
          className="h-6"
          style={{
            width: `${Math.min(
              (1 - progressNextLevel / (50 * (stats.level + 1) * stats.level)) *
                100,
              100
            )}%`,
            backgroundColor: "#4ade80",
          }}
        />

        <p className="absolute left-2 top-0.5 text-sm">
          {stats.xp} / {nextLevelXp} xp
        </p>
      </div>

      <div className="flex justify-between w-full max-w-2xl">
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Flame />
            <p>{t("stats.current_streak", { count: stats.current_streak })}</p>
          </div>

          {!isCurrentStreakTheLongest && (
            <div className="flex gap-2">
              <Zap />
              <p>
                {t("stats.longest_streak", { count: stats.longest_streak })}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <Award />
            <p>{t("stats.level", { level: stats.level })}</p>
          </div>

          <div className="flex gap-2">
            <Calendar />
            <p>
              {t("stats.last_day")}
              {lastDay}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
