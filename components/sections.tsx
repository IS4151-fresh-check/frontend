import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { theme } from "./theme";

export type RipenessStage =
  | "not_yet_ripe"
  | "peak_ripe"
  | "past_peak"
  | "spoilt";

export const RIPENESS_LABELS: Record<RipenessStage, string> = {
  not_yet_ripe: "Not yet ripe",
  peak_ripe: "Peak ripe",
  past_peak: "Past peak",
  spoilt: "Spoilt",
};

/** Display order for grouped lists on the home screen */
export const RIPENESS_ORDER: RipenessStage[] = [
  "not_yet_ripe",
  "peak_ripe",
  "past_peak",
  "spoilt",
];

export function getNextRipenessStage(
  current: RipenessStage,
): RipenessStage | null {
  const i = RIPENESS_ORDER.indexOf(current);
  if (i === -1 || i >= RIPENESS_ORDER.length - 1) {
    return null;
  }
  return RIPENESS_ORDER[i + 1];
}

export type Section = {
  id: string;
  name: string;
  description: string;
  icon: string;
  stockDate: Date;
  ripeness: RipenessStage;
  /** Shown as "Arrived X days ago" on the details shelf-life card. */
  daysSinceArrival: number;
  /** Elapsed days in the current ripeness stage (progress numerator). */
  daysInCurrentStage: number;
  /** Countdown to the next stage; 0 at the final ripeness stage. */
  daysUntilNextTransition: number;
  tagColor: string;
  accentColor: string;
};

type SectionCardProps = {
  item: Section;
  onPress: (section: Section) => void;
};

export function SectionCard({ item, onPress }: SectionCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress(item)}
      activeOpacity={0.82}
    >
      {/* Left accent bar */}
      <View style={[styles.accentBar, { backgroundColor: item.accentColor }]} />

      {/* Icon bubble */}
      <View style={[styles.iconBubble, { backgroundColor: item.tagColor }]}>
        <Text style={styles.icon}>{item.icon}</Text>
      </View>

      {/* Text content */}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <View style={[styles.tag, { backgroundColor: item.tagColor }]}>
            <Text style={[styles.tagText, { color: item.accentColor }]}>
              {RIPENESS_LABELS[item.ripeness]}
            </Text>
          </View>
        </View>
        <Text style={styles.stockDateLine}>
          Stocked {item.stockDate.toLocaleDateString()}
        </Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>

      {/* Arrow */}
      <Text style={[styles.arrow, { color: item.accentColor }]}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },

  // Header
  header: {
    backgroundColor: theme.surface,
    paddingTop: Platform.OS === "ios" ? 56 : 40,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  headerGreeting: {
    fontSize: 13,
    color: theme.textMuted,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.text,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.bg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.border,
  },
  cartIcon: {
    fontSize: 20,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.bg,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: theme.border,
    gap: 8,
  },
  searchIcon: {
    fontSize: 15,
  },
  searchPlaceholder: {
    fontSize: 14,
    color: theme.textMuted,
    fontWeight: "400",
  },

  // Count row
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  },
  countText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.text,
  },
  freshDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.primaryLight,
  },
  countSubText: {
    fontSize: 13,
    color: theme.textMuted,
  },

  // List
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  listFooter: {
    height: 32,
  },

  // Card
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.surface,
    borderRadius: 16,
    marginBottom: 10,
    overflow: "hidden",
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: theme.border,
    minHeight: 88,
  },
  accentBar: {
    width: 4,
    alignSelf: "stretch",
  },
  iconBubble: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 12,
    flexShrink: 0,
  },
  icon: {
    fontSize: 26,
  },
  cardBody: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
    flexWrap: "wrap",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.text,
    letterSpacing: -0.2,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  stockDateLine: {
    fontSize: 11,
    color: theme.textMuted,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
    color: theme.textMuted,
    lineHeight: 17,
    marginBottom: 6,
  },
  itemCount: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  arrow: {
    fontSize: 28,
    fontWeight: "300",
    paddingRight: 14,
    marginTop: -2,
  },
});
