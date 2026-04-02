import { Platform, StyleSheet, View, FlatList, Pressable } from "react-native";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Fonts } from "@/constants/theme";
import { theme } from "@/components/theme";

const alerts = [
  {
    id: "1",
    title: "High Gas Detected",
    description: "Sensor S0 detected abnormal VOC levels.",
    type: "critical",
  },
  {
    id: "2",
    title: "Ripening Started",
    description: "Banana VOC levels increasing steadily.",
    type: "info",
  },
  {
    id: "3",
    title: "Sensor Offline",
    description: "Sensor S2 has stopped responding.",
    type: "warning",
  },
];

export default function TabTwoScreen() {
  const renderItem = ({ item }: any) => {
    const colorMap: any = {
      critical: "#FF4D4F",
      warning: "#FAAD14",
      info: "#1677FF",
    };

    return (
      <View style={styles.card}>
        {/* Accent bar */}
        <View
          style={[styles.accentBar, { backgroundColor: colorMap[item.type] }]}
        />

        {/* Icon */}
        <View
          style={[
            styles.iconBubble,
            { backgroundColor: colorMap[item.type] + "20" },
          ]}
        >
          <ThemedText style={styles.icon}>⚠️</ThemedText>
        </View>

        {/* Content */}
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

          <ThemedText style={styles.cardDescription}>
            {item.description}
          </ThemedText>
        </View>

        <Pressable
          style={styles.resolveButton}
          onPress={() => console.log("Resolved:", item.id)}
        >
          <ThemedText
            style={{ color: theme.primary, fontSize: 12, fontWeight: "700" }}
          >
            Resolve
          </ThemedText>
        </Pressable>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <ThemedText style={styles.headerGreeting}>System Alerts</ThemedText>
            <ThemedText style={styles.headerTitle}>Notifications</ThemedText>
          </View>
        </View>
      </View>

      {/* Count */}
      <View style={styles.countRow}>
        <ThemedText style={styles.countText}>{alerts.length} Alerts</ThemedText>
        <View style={styles.freshDot} />
        <ThemedText style={styles.countSubText}>Updated just now</ThemedText>
      </View>

      {/* List */}
      <FlatList
        data={alerts}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
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
  resolveButton: {
  fontSize: 12,
  fontWeight: "700",
  color: theme.primary,
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: theme.primary,
  marginEnd: 10
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
    alignSelf: "flex-start"
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
