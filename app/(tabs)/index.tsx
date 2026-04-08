import {
  RIPENESS_LABELS,
  RIPENESS_ORDER,
  RipenessStage,
  Section,
  SectionCard,
} from "@/components/sections";
import { theme } from "@/components/theme";
import { fetchSections } from "@/lib/api";
import { mapApiSectionToSection } from "@/lib/map-section";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function groupSectionsByRipeness(
  sections: Section[],
): Record<RipenessStage, Section[]> {
  const empty: Record<RipenessStage, Section[]> = {
    not_yet_ripe: [],
    peak_ripe: [],
    past_peak: [],
    spoilt: [],
  };
  for (const s of sections) {
    empty[s.ripeness].push(s);
  }
  return empty;
}

export default function HomeScreen() {
  const router = useRouter();
  const [sections, setSections] = useState<Section[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSections = useCallback(async () => {
    setLoadError(null);
    try {
      const docs = await fetchSections();
      setSections(docs.map(mapApiSectionToSection));
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Failed to load sections");
      setSections([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSections();
  }, [loadSections]);

  const byRipeness = groupSectionsByRipeness(sections);

  const handlePress = (section: Section) => {
    router.push({
      pathname: "/details",
      params: { sectionId: section.id },
    });
  };

  const handleRefresh = async () => {
    setIsLoading(true);
    await loadSections();
    Alert.alert("Data refreshed");
  };
  // const handlePress = (section: Section) => {
  //   router.push({
  //     pathname: '/details',
  //     params: {
  //       id: section.id,
  //       name: section.name,
  //       description: section.description,
  //       icon: section.icon,
  //       itemCount: section.itemCount,
  //       tag: section.tag,
  //       tagColor: section.tagColor,
  //       accentColor: section.accentColor,
  //     },
  //   });
  // };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreeting}>Welcome 👋</Text>
            <Text style={styles.headerTitle}>Fruit Sections</Text>
          </View>
          <View style={styles.cartButton}>
            <Text style={styles.cartIcon}>🛒</Text>
          </View>
        </View>

        {/* Search bar (decorative) */}
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <Text style={styles.searchPlaceholder}>
            Search sections or products…
          </Text>
        </View>
      </View>

      {/* Sections count */}
      <View style={styles.countRow}>
        <Text style={styles.countText}>
          {sections.length} sections available
        </Text>
        <View style={styles.freshDot} />
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

      {/* Scrollable list */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {loadError !== null ? (
          <Text style={styles.errorText}>{loadError}</Text>
        ) : null}
        {!isLoading && sections.length === 0 && loadError === null ? (
          <Text style={styles.errorText}>No sections yet. Add some via POST /api/section.</Text>
        ) : null}
        {isLoading && sections.length === 0 ? (
          <View style={styles.centeredLoader}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : null}
        {RIPENESS_ORDER.filter((stage) => byRipeness[stage].length > 0).map(
          (stage, blockIndex) => {
            const rows = byRipeness[stage];
            return (
              <View key={stage} style={styles.ripenessBlock}>
                <Text
                  style={[
                    styles.ripenessHeading,
                    blockIndex === 0 && styles.ripenessHeadingFirst,
                  ]}
                >
                  {RIPENESS_LABELS[stage]}
                </Text>
                {rows.map((section) => (
                  <SectionCard
                    key={section.id}
                    item={section}
                    onPress={() => handlePress(section)}
                  />
                ))}
              </View>
            );
          },
        )}
        <View style={styles.listFooter} />
      </ScrollView>
    </View>
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
  ripenessBlock: {
    marginBottom: 8,
  },
  ripenessHeading: {
    fontSize: 13,
    fontWeight: "800",
    color: theme.textMuted,
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginBottom: 10,
    marginTop: 20,
  },
  ripenessHeadingFirst: {
    marginTop: 0,
  },
  listFooter: {
    height: 32,
  },
  errorText: {
    fontSize: 14,
    color: "#C62828",
    marginBottom: 12,
    lineHeight: 20,
  },
  centeredLoader: {
    paddingVertical: 48,
    alignItems: "center",
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
