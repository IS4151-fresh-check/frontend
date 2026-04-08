import { theme } from "@/components/theme";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { type ApiAlert, fetchActiveAlerts, resolveAlert } from "@/lib/api";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

function sectionSubtitle(a: ApiAlert): string {
  const sid = a.sectionId;
  if (typeof sid === "object" && sid !== null && "location" in sid) {
    return sid.location;
  }
  return "";
}

/** Server should only return active alerts; keep this so the UI never shows resolved rows. */
function sortActiveAlerts(data: ApiAlert[]): ApiAlert[] {
  return [...data]
    .filter((a) => a.status === "active")
    .sort((a, b) => {
      const ta = Date.parse(a.createdAt ?? "") || 0;
      const tb = Date.parse(b.createdAt ?? "") || 0;
      if (tb !== ta) {
        return tb - ta;
      }
      return String(b._id).localeCompare(String(a._id));
    });
}

export default function TabTwoScreen() {
  const [alerts, setAlerts] = useState<ApiAlert[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    setLoading(true);
    try {
      const data = await fetchActiveAlerts();
      setAlerts(sortActiveAlerts(data));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load alerts");
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onResolve = async (item: ApiAlert) => {
    const id = String(item._id);
    setResolvingId(id);
    try {
      await resolveAlert(id);
      const data = await fetchActiveAlerts();
      setAlerts(sortActiveAlerts(data));
    } catch (e) {
      Alert.alert(
        "Could not resolve",
        e instanceof Error ? e.message : "Unknown error",
      );
    } finally {
      setResolvingId(null);
    }
  };

  const renderItem = ({ item }: { item: ApiAlert }) => {
    const colorMap: Record<ApiAlert["type"], string> = {
      critical: "#FF4D4F",
      warning: "#FAAD14",
      info: "#1677FF",
    };

    const sub = sectionSubtitle(item);

    return (
      <View style={styles.card}>
        <View
          style={[styles.accentBar, { backgroundColor: colorMap[item.type] }]}
        />

        <View
          style={[
            styles.iconBubble,
            { backgroundColor: colorMap[item.type] + "20" },
          ]}
        >
          <ThemedText style={styles.icon}>⚠️</ThemedText>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.cardHeader}>
            <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
          </View>
          <View
            style={[
              styles.tag,
              { backgroundColor: colorMap[item.type] + "20" },
            ]}
          >
            <ThemedText
              style={[styles.tagText, { color: colorMap[item.type] }]}
            >
              {item.type}
            </ThemedText>
          </View>
          {sub !== "" ? (
            <ThemedText style={styles.sectionLine}>{sub}</ThemedText>
          ) : null}
          <ThemedText style={styles.cardDescription}>{item.message}</ThemedText>
        </View>

        <Pressable
          style={styles.resolveButton}
          onPress={() => onResolve(item)}
          disabled={resolvingId === String(item._id)}
        >
          {resolvingId === String(item._id) ? (
            <ActivityIndicator size="small" color={theme.primary} />
          ) : (
            <ThemedText
              style={{ color: theme.primary, fontSize: 12, fontWeight: "700" }}
            >
              Resolve
            </ThemedText>
          )}
        </Pressable>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <ThemedText style={styles.headerGreeting}>System alerts</ThemedText>
            <ThemedText style={styles.headerTitle}>Notifications</ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.countRow}>
        <ThemedText style={styles.countText}>
          {loading ? "…" : `${alerts.length} active`}
        </ThemedText>
        <View style={styles.freshDot} />
     
      </View>

      {loadError !== null ? (
        <View style={styles.banner}>
          <ThemedText style={styles.bannerText}>{loadError}</ThemedText>
        </View>
      ) : null}

      <FlatList
        data={alerts}
        keyExtractor={(item) => String(item._id)}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          loading ? (
            <View style={styles.emptyWrap}>
              <ActivityIndicator size="large" color={theme.primary} />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <ThemedText style={styles.emptyText}>No active alerts.</ThemedText>
            </View>
          )
        }
        ListFooterComponent={<View style={styles.listFooter} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
  },

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
  resolveButton: {
    fontSize: 12,
    fontWeight: "700",
    color: theme.primary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
    alignSelf: "center",
    marginRight: 8,
    minWidth: 72,
    alignItems: "center",
    justifyContent: "center",
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
  countRow: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  banner: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  bannerText: {
    color: "#C62828",
    fontSize: 13,
  },
  list: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  listFooter: {
    height: 32,
  },
  emptyWrap: {
    paddingVertical: 48,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: theme.textMuted,
  },
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
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },
  sectionLine: {
    fontSize: 12,
    color: theme.textMuted,
    marginBottom: 4,
    fontWeight: "600",
  },
  cardDescription: {
    fontSize: 12,
    color: theme.textMuted,
    lineHeight: 17,
    marginBottom: 6,
  },
});
