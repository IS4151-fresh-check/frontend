import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "./theme";

interface SensorBarProps {
  label: string;
  value: number;
  unit: string;
  max: number;
  color: string;
}

export const SensorBar = ({
  label,
  value,
  unit,
  max,
  color,
}: SensorBarProps) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <View style={styles.sensorContainer}>
      <View style={styles.sensorHeader}>
        <Text style={styles.sensorLabel}>{label}</Text>
        <Text style={[styles.sensorValue, { color }]}>
          {value}
          {unit}
        </Text>
      </View>
      <View style={styles.barBackground}>
        <View
          style={[
            styles.barFill,
            { width: `${percentage}%`, backgroundColor: color },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sensorContainer: {
    marginBottom: 16,
    marginTop: 8,
  },
  sensorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  sensorLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.text,
  },
  sensorValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  barBackground: {
    height: 8,
    backgroundColor: theme.bg,
    borderRadius: 4,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 4,
  },
});
