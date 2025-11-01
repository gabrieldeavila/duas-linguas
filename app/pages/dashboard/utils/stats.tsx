import { eachDayOfInterval, endOfYear, format, startOfYear } from "date-fns";
import { Award, Calendar, Flame, Zap } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import ActivityCalendar, { type Activity } from "react-activity-calendar";
import { useTranslation } from "react-i18next";
import { useSupabase } from "~/components/internal/supabaseAuth";
import { Skeleton } from "~/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import {
  type UserStatsActivityProps,
  type UserStatsProps,
} from "~/types/table.types";

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
      <ActivityStatsBox />

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

const ActivityStatsBox = () => {
  const { t } = useTranslation("dashboard");
  const [quizzesTaken, setQuizzesTaken] =
    useState<UserStatsActivityProps | null>(null);
  const activityData: Activity[] = useMemo(() => {
    if (!quizzesTaken) return [];
    const today = new Date();
    const startDate = startOfYear(today);
    const allDays = eachDayOfInterval({
      start: startDate,
      end: endOfYear(today),
    });

    const greatestCount = Math.max(
      ...quizzesTaken.map((d) => d.total_quizzes_taken),
      1
    );

    return allDays.map((day) => {
      const date = format(day, "yyyy-MM-dd");
      const found = quizzesTaken.find((d) => format(d.day, "yyyy-MM-dd") === date);
      return {
        date,
        count: found ? found.total_quizzes_taken : 0,
        level: found
          ? Math.ceil((found.total_quizzes_taken / greatestCount) * 4)
          : 0,
      };
    });
  }, [quizzesTaken]);

  const quizCount = useMemo(
    () => activityData.reduce((sum, day) => sum + day.count, 0),
    [activityData]
  );
  const supabase = useSupabase();
  const isLoadingRef = useRef(false);

  useEffect(() => {
    if (isLoadingRef.current) return;

    const startOfYearTimestamp = startOfYear(new Date()).toISOString();
    const endOfYearTimestamp = endOfYear(new Date()).toISOString();

    supabase
      .rpc("get_quiz_stats", {
        p_start_date: startOfYearTimestamp,
        p_end_date: endOfYearTimestamp,
      })
      .then(({ data, error }) => {
        if (error || !data) {
          console.error("Error fetching quiz stats:", error);
        } else {
          // Handle fetched data if needed
          console.log("Fetched quiz stats:", data);
          setQuizzesTaken(data);
        }
      });
  }, [supabase]);

  return (
    <div
      className={cn(
        "mb-4",
        "w-full",
        "max-w-sm sm:max-w-2xl lg:max-w-2xl xl:max-w-fit"
      )}
    >
      <TooltipProvider delayDuration={0}>
        <ActivityCalendar
          data={activityData}
          labels={{
            months: [
              t("stats.activity_calendar.months.jan"),
              t("stats.activity_calendar.months.feb"),
              t("stats.activity_calendar.months.mar"),
              t("stats.activity_calendar.months.apr"),
              t("stats.activity_calendar.months.may"),
              t("stats.activity_calendar.months.jun"),
              t("stats.activity_calendar.months.jul"),
              t("stats.activity_calendar.months.aug"),
              t("stats.activity_calendar.months.sep"),
              t("stats.activity_calendar.months.oct"),
              t("stats.activity_calendar.months.nov"),
              t("stats.activity_calendar.months.dec"),
            ],
            legend: {
              less: t("stats.activity_calendar.legend.less"),
              more: t("stats.activity_calendar.legend.more"),
            },
            totalCount: t("stats.activity_calendar.total_count", {
              count: quizCount,
            }),
          }}
          theme={{
            light: [
              "var(--accent)",
              "var(--sidebar-border)",
              "var(--primary)",
              "var(--sidebar-ring)",
              "var(--destructive)",
            ],
            dark: [
              "var(--accent)",
              "var(--sidebar-border)",
              "var(--primary)",
              "var(--sidebar-ring)",
              "var(--destructive)",
            ],
          }}
          loading={!activityData.length}
          renderBlock={(block, activity) => {
            return (
              <Tooltip>
                <TooltipTrigger asChild className="cursor-default">
                  {block}
                </TooltipTrigger>
                <TooltipContent side="right" align="center">
                  {t("stats.activity_calendar.total_count", {
                    count: activity.count,
                  })}
                </TooltipContent>
              </Tooltip>
            );
          }}
        />
      </TooltipProvider>
    </div>
  );
};
