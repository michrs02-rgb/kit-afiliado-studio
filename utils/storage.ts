import { DailyGoalData, SavedVideoItem } from "@/types";

const DAILY_GOAL_KEY = "kit_afiliado_daily_goal_v1";
const SAVED_VIDEOS_KEY = "kit_afiliado_saved_videos_v1";

export function getTodayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getDailyGoal(): DailyGoalData {
  if (typeof window === "undefined") {
    return { date: getTodayString(), count: 0 };
  }

  const today = getTodayString();
  try {
    const raw = localStorage.getItem(DAILY_GOAL_KEY);
    if (!raw) {
      const initial: DailyGoalData = { date: today, count: 0 };
      localStorage.setItem(DAILY_GOAL_KEY, JSON.stringify(initial));
      return initial;
    }

    const parsed: DailyGoalData = JSON.parse(raw);
    if (parsed.date !== today) {
      // New day: auto-reset
      const reset: DailyGoalData = { date: today, count: 0 };
      localStorage.setItem(DAILY_GOAL_KEY, JSON.stringify(reset));
      return reset;
    }

    return parsed;
  } catch {
    return { date: today, count: 0 };
  }
}

export function incrementDailyGoal(): number {
  if (typeof window === "undefined") return 1;
  const current = getDailyGoal();
  const updated: DailyGoalData = {
    date: current.date,
    count: current.count + 1,
  };
  try {
    localStorage.setItem(DAILY_GOAL_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
  return updated.count;
}

export function setDailyGoalCount(count: number): void {
  if (typeof window === "undefined") return;
  const today = getTodayString();
  const updated: DailyGoalData = {
    date: today,
    count: Math.max(0, count),
  };
  try {
    localStorage.setItem(DAILY_GOAL_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
}

export function getSavedVideos(): SavedVideoItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SAVED_VIDEOS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedVideoItem[];
  } catch {
    return [];
  }
}

export function saveVideoItem(item: SavedVideoItem): void {
  if (typeof window === "undefined") return;
  try {
    const current = getSavedVideos();
    const index = current.findIndex((v) => v.id === item.id);
    if (index >= 0) {
      current[index] = item;
    } else {
      current.unshift(item);
    }
    localStorage.setItem(SAVED_VIDEOS_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

export function deleteVideoItem(id: string): SavedVideoItem[] {
  if (typeof window === "undefined") return [];
  try {
    const current = getSavedVideos().filter((v) => v.id !== id);
    localStorage.setItem(SAVED_VIDEOS_KEY, JSON.stringify(current));
    return current;
  } catch {
    return [];
  }
}
