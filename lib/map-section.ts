import {
  type ApiSection,
  type ApiSectionStage,
} from "@/lib/api";
import type { RipenessStage, Section } from "@/components/sections";

const STAGE_TO_RIPENESS: Record<ApiSectionStage, RipenessStage> = {
  pending: "not_yet_ripe",
  fresh: "not_yet_ripe",
  ripe: "peak_ripe",
  overripe: "past_peak",
  spoiled: "spoilt",
};

const RIPENESS_THEME: Record<
  RipenessStage,
  { tagColor: string; accentColor: string }
> = {
  not_yet_ripe: { tagColor: "#E3F2FD", accentColor: "#1565C0" },
  peak_ripe: { tagColor: "#E8F5E9", accentColor: "#2E7D32" },
  past_peak: { tagColor: "#FFF8E1", accentColor: "#F57F17" },
  spoilt: { tagColor: "#FFEBEE", accentColor: "#C62828" },
};

function daysBetween(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

function normalizeId(id: unknown): string {
  if (typeof id === "string") {
    return id;
  }
  if (
    id !== null &&
    typeof id === "object" &&
    "$oid" in id &&
    typeof (id as { $oid: unknown }).$oid === "string"
  ) {
    return (id as { $oid: string }).$oid;
  }
  return String(id);
}

export function mapApiSectionToSection(doc: ApiSection): Section {
  const ripeness =
    STAGE_TO_RIPENESS[doc.currentStage] ?? "not_yet_ripe";
  const { tagColor, accentColor } = RIPENESS_THEME[ripeness];
  const arrived = new Date(doc.arrivedAt);
  const daysSinceArrival = daysBetween(arrived, new Date());
  const daysUntilNextTransition = Math.max(
    0,
    Math.round(doc.daysToNextStage ?? 0),
  );
  const daysInCurrentStage = Math.max(
    1,
    daysSinceArrival > 0 ? Math.min(daysSinceArrival, 14) : 1,
  );

  return {
    id: normalizeId(doc._id),
    name: doc.location,
    description: doc.name,
    icon: "🍌",
    stockDate: arrived,
    ripeness,
    daysSinceArrival,
    daysInCurrentStage,
    daysUntilNextTransition,
    tagColor,
    accentColor,
  };
}
