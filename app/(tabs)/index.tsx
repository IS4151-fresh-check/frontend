import { Section, SectionCard } from "@/components/sections";
import { theme } from "@/components/theme";
import { useRouter } from "expo-router";
import {
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { Rect, Svg } from "react-native-svg";

interface DraggableProps {
  initialX: number;
  initialY: number;
  gasLevel: number;
}

const DraggableSection = ({ initialX, initialY, gasLevel }: DraggableProps) => {
  const translateX = useSharedValue(initialX);
  const translateY = useSharedValue(initialY);
  const dragGesture = Gesture.Pan().onUpdate((event) => {
    translateX.value = event.translationX + initialX;
    translateY.value = event.translationY + initialY;
  });
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));
  const fillColor = gasLevel > 70 ? "red" : gasLevel > 40 ? "yellow" : "green";
  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View style={animatedStyle}>
        <Svg height="100" width="100" fill="white">
          <Rect width="80" height="40" fill={fillColor} stroke="black"></Rect>
        </Svg>
      </Animated.View>
    </GestureDetector>
  );
};

const SECTIONS: Section[] = [
  {
    id: "1",
    name: "Fresh Produce",
    description: "Farm-fresh fruits, vegetables and herbs sourced daily.",
    icon: "🥦",
    itemCount: 148,
    tag: "Popular",
    tagColor: "#E8F5E9",
    accentColor: "#2E7D32",
  },
  {
    id: "2",
    name: "Bakery & Bread",
    description: "Freshly baked goods, artisan loaves and pastries.",
    icon: "🍞",
    itemCount: 62,
    tag: "Fresh Daily",
    tagColor: "#FFF8E1",
    accentColor: "#F57F17",
  },
  {
    id: "3",
    name: "Dairy & Eggs",
    description: "Milk, cheese, yoghurt, butter and free-range eggs.",
    icon: "🥛",
    itemCount: 95,
    tag: "Chilled",
    tagColor: "#E3F2FD",
    accentColor: "#1565C0",
  },
  {
    id: "4",
    name: "Meat & Seafood",
    description: "Premium cuts, poultry, fresh fish and shellfish.",
    icon: "🥩",
    itemCount: 110,
    tag: "Premium",
    tagColor: "#FCE4EC",
    accentColor: "#C62828",
  },
  {
    id: "5",
    name: "Frozen Foods",
    description: "Frozen meals, ice cream, vegetables and snacks.",
    icon: "🧊",
    itemCount: 203,
    tag: "Frozen",
    tagColor: "#E0F7FA",
    accentColor: "#00838F",
  },
  {
    id: "6",
    name: "Beverages",
    description: "Juices, soft drinks, coffee, tea and water.",
    icon: "🧃",
    itemCount: 178,
    tag: "All Brands",
    tagColor: "#F3E5F5",
    accentColor: "#6A1B9A",
  },
  {
    id: "7",
    name: "Snacks & Confectionery",
    description: "Chips, biscuits, chocolates, candy and nuts.",
    icon: "🍫",
    itemCount: 240,
    tag: "Best Sellers",
    tagColor: "#FFF3E0",
    accentColor: "#E65100",
  },
];

export default function HomeScreen() {
  const router = useRouter();
  const handlePress = () => {
    console.log("PRess");
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
          {SECTIONS.length} sections available
        </Text>
        <View style={styles.freshDot} />
        <Text style={styles.countSubText}>Updated today</Text>
      </View>

      {/* Scrollable list */}
      <ScrollView
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      >
        {SECTIONS.map((section) => (
          <SectionCard key={section.id} item={section} onPress={handlePress} />
        ))}
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
