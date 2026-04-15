import { SimplePpmChart } from "@/components/ppm-graph";
import {
  RIPENESS_LABELS,
  RipenessStage,
  getNextRipenessStage,
} from "@/components/sections";
import { SensorBar } from "@/components/sensor";
import { theme } from "@/components/theme";
import {
  type ApiReading,
  type ApiSection,
  fetchReadingsForSection,
  fetchSectionById,
} from "@/lib/api";
import { mapApiSectionToSection } from "@/lib/map-section";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  LayoutAnimation,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const SHELF_ACCENT = "#A67C52";

function paramString(v: string | string[] | undefined): string | undefined {
  if (v === undefined) {
    return undefined;
  }
  return Array.isArray(v) ? v[0] : v;
}

function formatReadingTime(iso: string | undefined): string {
  if (iso === undefined || iso === "") {
    return "—";
  }
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

/**
 * MongoDB stores raw base64 (not a hosted URL). React Native Image needs a data URI:
 * `source={{ uri: 'data:image/jpeg;base64,' + payload }}` (see RN docs).
 * Strip whitespace/newlines; detect PNG vs JPEG from payload start.
 */
function sectionImageUri(raw: string | undefined): string | null {
  if (raw === undefined) {
    return null;
  }
  if (typeof raw !== "string") {
    return null;
  }
  let t = raw.trim().replace(/\s/g, "");
  if (t === "") {
    return null;
  }
  if (t.startsWith("data:")) {
    return t;
  }
  if (t.startsWith("http://") || t.startsWith("https://")) {
    return t;
  }
  const mime = t.startsWith("iVBOR") ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${t}`;
}

export default function SectionDetails() {
  const router = useRouter();
  const params = useLocalSearchParams<{ sectionId?: string }>();
  const sectionId = paramString(params.sectionId);

  const [apiSection, setApiSection] = useState<ApiSection | null>(null);
  const [readings, setReadings] = useState<ApiReading[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [readingsError, setReadingsError] = useState<string | null>(null);
  const [sectionImageError, setSectionImageError] = useState<string | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const load = useCallback(
    async (silent = false) => {
      if (sectionId === undefined || sectionId === "") {
        return;
      }
      setLoadError(null);
      setReadingsError(null);
      if (!silent) {
        setIsLoading(true);
      }
      try {
        const doc = await fetchSectionById(sectionId);
        setApiSection(doc);
        try {
          const reads = await fetchReadingsForSection(sectionId, 15);
          setReadings(reads);
        } catch (re) {
          setReadings([]);
          setReadingsError(
            re instanceof Error ? re.message : "Could not load readings",
          );
        }
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Failed to load section");
        setApiSection(null);
        setReadings([]);
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [sectionId],
  );

  const REFRESH_MS = 60 * 1000;

  useEffect(() => {
    void load(false);
    const intervalId = setInterval(() => {
      void load(true);
    }, REFRESH_MS);
    return () => clearInterval(intervalId);
  }, [load]);

  const mapped =
    apiSection !== null ? mapApiSectionToSection(apiSection) : null;
  const ripeness: RipenessStage = mapped?.ripeness ?? "not_yet_ripe";
  const daysSinceArrival = mapped?.daysSinceArrival ?? 0;
  const daysInCurrentStage = mapped?.daysInCurrentStage ?? 1;
  const daysUntilNextTransition = mapped?.daysUntilNextTransition ?? 0;

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

  const handleRefresh = async () => {
    await load(false);
    Alert.alert("Data refreshed");
  };

  const title =
    apiSection?.location ??
    mapped?.name ??
    (sectionId !== undefined ? "Section" : "Section details");
  const overviewBody =
    apiSection !== null
      ? `${apiSection.name}${
          apiSection.discountPercentage !== undefined &&
          apiSection.discountPercentage > 0
            ? ` · ${apiSection.discountPercentage}% discount`
            : ""
        }`
      : "Open a section from the home tab to load live data from the API.";

  const temp = apiSection?.temperature ?? 0;
  const hum = apiSection?.humidity ?? 0;
  const ppm = apiSection?.ppm ?? 0;

  const latest = readings.length > 0 ? readings[0] : null;

  const sectionPhotoUri = useMemo(
    () =>
      apiSection !== null ? sectionImageUri(apiSection.imageBase64) : null,
    [apiSection],
  );

  useEffect(() => {
    setSectionImageError(null);
  }, [sectionPhotoUri]);

  if (sectionId === undefined || sectionId === "") {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerInner}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialIcons name="chevron-left" size={28} color={theme.text} />
            </TouchableOpacity>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Section details</Text>
            </View>
          </View>
        </View>
        <View style={styles.missingWrap}>
          <Text style={styles.missingText}>
            No section selected. Choose a section on the home screen.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="chevron-left" size={28} color={theme.text} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={[styles.headerTag, { backgroundColor: "#E3F2FD" }]}>
              <Text style={[styles.headerTagText, { color: theme.primary }]}>
                Live monitoring
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.countRow}>
        <Text style={styles.countSubText}>
          {readings.length > 0
            ? `Latest reading ${formatReadingTime(readings[0]?.createdAt)}`
            : "No readings yet"}
        </Text>
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
        {loadError !== null ? (
          <Text style={styles.errorText}>{loadError}</Text>
        ) : null}

        {isLoading && apiSection === null ? (
          <View style={styles.centeredLoader}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : null}

        {apiSection !== null ? (
          <>
            <View style={styles.heroCard}>
              <Text style={styles.sectionLabel}>Overview</Text>
              <Text style={styles.heroDescription}>{overviewBody}</Text>
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
                <Text style={styles.shelfFooterLeft}>  </Text>
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

            <View style={styles.heroCard}>
              <Text style={styles.sectionLabel}>Environmental metrics</Text>
              <Text style={styles.metricsHint}></Text>
              <SensorBar
                label="Temperature"
                value={temp}
                unit="°C"
                max={50}
                color="#FF6B6B"
              />
              <SensorBar
                label="Humidity"
                value={hum}
                unit="%"
                max={100}
                color="#4DABF7"
              />
              <SensorBar
                label="Ethylene (PPM)"
                value={ppm}
                unit=" ppm"
                max={5}
                color="#51CF66"
              />
            </View>

            <View style={styles.heroCard}>
              <Text style={styles.sectionLabel}>CV image</Text>
              <Text style={styles.metricsHint}></Text>
              {sectionPhotoUri !== null ? (
                <>
                  <View style={styles.sectionImageFrame}>
                    <Image
                      source={{ uri: sectionPhotoUri }}
                      style={styles.sectionImageFill}
                      resizeMode="cover"
                      onError={() => {
                        setSectionImageError(
                          "Could not decode or display this image.",
                        );
                      }}
                    />
                  </View>
                  {sectionImageError !== null ? (
                    <Text style={styles.errorText}>{sectionImageError}</Text>
                  ) : null}
                </>
              ) : (
                <Text style={styles.heroDescription}>
                  No image stored for this section yet.
                </Text>
              )}
            </View>

            <View style={styles.heroCard}>
              <View style={styles.sectionLabelRow}>
                <Text style={styles.sectionLabel}>Statistics and Action</Text>
                <MaterialIcons
                  name="auto-awesome"
                  size={18}
                  color={theme.primary}
                />
              </View>
              <Text style={styles.heroDescription}>Ethanol PPM Graph</Text>
              <SimplePpmChart readings={readings} />
              {latest !== null ? (
                <>
                  <Text style={styles.heroDescription}>
                    Gas stage: {latest.gasStage} (
                    {(latest.gasConfidence * 100).toFixed(0)}% conf.) · CV:{" "}
                    {latest.cvStage} ({(latest.cvConfidence * 100).toFixed(0)}%
                    conf.)
                  </Text>
                  <Text style={styles.heroDescription}>
                    Action: {latest.action}
                  </Text>
                </>
              ) : (
                <Text style={styles.heroDescription}>
                  No readings in the readings collection for this section yet.
                </Text>
              )}
            </View>

            <View style={styles.heroCard}>
              {/* The Header - Tapping this toggles the list */}
              <Pressable
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  setIsExpanded(!isExpanded);
                }}
                style={({ pressed }) => [
                  {
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  },
                  pressed && { opacity: 0.7 },
                ]}
              >
                <View>
                  <Text style={styles.sectionLabel}>Readings (recent)</Text>
                  <Text style={styles.metricsHint}>
                    {isExpanded ? "Tap to hide" : "Tap to view"}
                  </Text>
                </View>

                {/* Simple chevron icon logic using text or a symbol */}
                <Text style={{ fontSize: 18, color: "#666" }}>
                  {isExpanded ? "▲" : "▼"}
                </Text>
              </Pressable>

              {/* The Expandable Content */}
              {isExpanded && (
                <View style={{ marginTop: 10 }}>
                  {readingsError !== null && (
                    <Text style={styles.errorText}>{readingsError}</Text>
                  )}

                  {readingsError === null && readings.length === 0 && (
                    <Text style={styles.heroDescription}>No rows to show.</Text>
                  )}

                  {readings.length > 0 &&
                    readings.map((r) => (
                      <View key={r._id} style={styles.readingRow}>
                        <Text style={styles.readingTime}>
                          {formatReadingTime(r.createdAt)}
                        </Text>
                        <Text style={styles.readingMeta}>
                          {r.temperature}°C · {r.humidity}% RH · {r.ppm} ppm ·
                          gas: {r.gasStage} · CV: {r.cvStage}
                        </Text>
                      </View>
                    ))}
                </View>
              )}
            </View>
          </>
        ) : null}

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
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
    flex: 1,
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
  metricsHint: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 4,
    marginBottom: 4,
  },
  /** Fixed frame; `cover` scales and crops from the center of the bitmap. */
  sectionImageFrame: {
    width: "100%",
    aspectRatio: 4 / 3,
    marginTop: 8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: theme.border,
  },
  sectionImageFill: {
    ...StyleSheet.absoluteFillObject,
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
  errorText: {
    fontSize: 14,
    color: "#C62828",
    marginBottom: 12,
  },
  centeredLoader: {
    paddingVertical: 32,
    alignItems: "center",
  },
  readingRow: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingVertical: 10,
  },
  readingTime: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.text,
  },
  readingMeta: {
    fontSize: 12,
    color: theme.textMuted,
    marginTop: 4,
    lineHeight: 17,
  },
  missingWrap: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  missingText: {
    fontSize: 15,
    color: theme.textMuted,
    lineHeight: 22,
  },
});
