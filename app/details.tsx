import { SensorBar } from "@/components/sensor";
import {
  RIPENESS_LABELS,
  RipenessStage,
  RIPENESS_ORDER,
  getNextRipenessStage,
} from "@/components/sections";
import { theme } from "@/components/theme";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

const SHELF_ACCENT = "#A67C52";

function paramString(
  v: string | string[] | undefined,
): string | undefined {
  if (v === undefined) {
    return undefined;
  }
  return Array.isArray(v) ? v[0] : v;
}

function parseRipeness(raw: string | undefined): RipenessStage {
  if (
    raw !== undefined &&
    RIPENESS_ORDER.includes(raw as RipenessStage)
  ) {
    return raw as RipenessStage;
  }
  return "not_yet_ripe";
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (raw === undefined) {
    return fallback;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) {
    return fallback;
  }
  return Math.floor(n);
}

export default function SectionDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name: string;
    description: string;
    ripeness?: string;
    daysSinceArrival?: string;
    daysInCurrentStage?: string;
    daysUntilNextTransition?: string;
  }>();

  const name = paramString(params.name);
  const description = paramString(params.description);
  const ripeness = parseRipeness(paramString(params.ripeness));
  const daysSinceArrival = parsePositiveInt(
    paramString(params.daysSinceArrival),
    4,
  );
  const daysInCurrentStage = parsePositiveInt(
    paramString(params.daysInCurrentStage),
    1,
  );
  const daysUntilNextTransition = parsePositiveInt(
    paramString(params.daysUntilNextTransition),
    2,
  );

  const nextStage = getNextRipenessStage(ripeness);
  const stageSpan = daysInCurrentStage + daysUntilNextTransition;
  const progressRatio =
    nextStage === null || stageSpan <= 0
      ? 1
      : Math.min(1, Math.max(0, daysInCurrentStage / stageSpan));

  const arrivedLabel =
    daysSinceArrival === 1
      ? "Arrived 1 day ago"
      : `Arrived ${daysSinceArrival} days ago`;

  let countdownLabel: string;
  if (nextStage === null || daysUntilNextTransition === 0) {
    countdownLabel = "Final stage";
  } else if (daysUntilNextTransition === 1) {
    countdownLabel = `~1 day until ${RIPENESS_LABELS[nextStage]}`;
  } else {
    countdownLabel = `~${daysUntilNextTransition} days until ${RIPENESS_LABELS[nextStage]}`;
  }

  const [isLoading, setIsLoading] = useState(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate a data fetch
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    Alert.alert("Data Refreshed!");
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="chevron-left" size={28} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{name || "Section Details"}</Text>
            <View style={[styles.headerTag, { backgroundColor: "#E3F2FD" }]}>
              <Text style={[styles.headerTagText, { color: theme.primary }]}>
                Live Monitoring
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.countRow}>
        <Text style={styles.countSubText}>Updated today</Text>
        <View>
          <TouchableOpacity onPress={handleRefresh} disabled={isLoading}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#0000ff" />
            ) : (
              <MaterialIcons name="refresh" size={20} color="#0000ff" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Description Hero */}
        <View style={styles.heroCard}>
          <Text style={styles.sectionLabel}>Overview</Text>
          <Text style={styles.heroDescription}>
            {description ||
              "Monitoring environmental conditions for this section to ensure optimal preservation and quality control."}
          </Text>
        </View>

        <View style={styles.heroCard}>
          <Text style={styles.sectionLabel}>Shelf life</Text>
          <View style={styles.shelfTrack}>
            <View
              style={[
                styles.shelfFill,
                {
                  width: `${Math.round(progressRatio * 100)}%`,
                  backgroundColor: SHELF_ACCENT,
                },
              ]}
            />
          </View>
          <View style={styles.shelfFooter}>
            <Text style={styles.shelfFooterLeft}>{arrivedLabel}</Text>
            <Text
              style={[
                styles.shelfFooterRight,
                {
                  color:
                    nextStage !== null && daysUntilNextTransition > 0
                      ? SHELF_ACCENT
                      : theme.textMuted,
                },
              ]}
            >
              {countdownLabel}
            </Text>
          </View>
        </View>

        {/* Environmental Data (The Bars) */}
        <View style={styles.heroCard}>
          <Text style={styles.sectionLabel}>Environmental Metrics</Text>

          <SensorBar
            label="Temperature"
            value={24}
            unit="°C"
            max={50}
            color="#FF6B6B"
          />
          <SensorBar
            label="Humidity"
            value={65}
            unit="%"
            max={100}
            color="#4DABF7"
          />
          <SensorBar
            label="Ethylene Gas"
            value={0.4}
            unit=" ppm"
            max={5}
            color="#51CF66"
          />
        </View>

        {/* AI Analysis Placeholder */}
        <View
          style={[
            styles.heroCard,
            { borderStyle: "dashed", backgroundColor: "transparent" },
          ]}
        >
          <View style={styles.sectionLabelRow}>
            <Text style={styles.sectionLabel}>AI Insights</Text>
            <MaterialIcons
              name="auto-awesome"
              size={18}
              color={theme.primary}
            />
          </View>

          <View style={styles.aiPlaceholder}>
            <Text style={styles.aiPlaceholderText}>
              [ ML/AI Analysis Content Will Appear Here ]
            </Text>
            <Text style={styles.heroDescription}>
              The model is currently calculating freshness trends and predicted
              shelf life based on ethylene levels...
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  aiPlaceholder: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  aiPlaceholderText: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 8,
  },
  // Re-using your provided style keys:
  container: { flex: 1, backgroundColor: theme.bg },
  header: {
    backgroundColor: theme.surface,
    paddingTop: Platform.OS === "ios" ? 54 : 36,
    paddingBottom: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: theme.border,
  },
  headerInner: { flexDirection: "row", alignItems: "center", gap: 12 },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.bg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.border,
  },
  headerText: { flex: 1, gap: 4 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: theme.text },
  headerTag: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  headerTagText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  countRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  },
  countSubText: {
    fontSize: 13,
    color: theme.textMuted,
  },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16 },
  heroCard: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: theme.border,
  },
  heroDescription: {
    fontSize: 14,
    color: theme.textMuted,
    lineHeight: 20,
    marginTop: 8,
  },
  sectionLabel: { fontSize: 16, fontWeight: "700", color: theme.text },
  shelfTrack: {
    marginTop: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.border,
    overflow: "hidden",
  },
  shelfFill: {
    height: 8,
    borderRadius: 4,
  },
  shelfFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 10,
    gap: 12,
  },
  shelfFooterLeft: {
    flex: 1,
    fontSize: 13,
    color: theme.textMuted,
    fontWeight: "500",
  },
  shelfFooterRight: {
    flexShrink: 0,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    maxWidth: "52%",
  },
  sectionLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bottomSpacer: { height: 40 },
});
