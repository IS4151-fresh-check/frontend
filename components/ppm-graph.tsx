import { LineChart } from "react-native-chart-kit";
import { Dimensions, View, Text } from "react-native";

// Simple helper to format the data
export const SimplePpmChart = ({ readings }: { readings: any[] }) => {
  // Guard against empty data
  if (!readings || readings.length === 0) {
    return <Text>No data to plot</Text>;
  }

  const chartData = {
    labels: [], // Leaving this empty for a "simple" look without X-axis text
    datasets: [
      {
        // Extract ppm and reverse so oldest is on the left, newest on the right
        data: readings.map((r) => r.ppm).reverse(),
        color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`, // Blue line
        strokeWidth: 3,
      },
    ],
  };

  return (
    <View style={{ alignItems: 'center' }}>
      <LineChart
        data={chartData}
        width={Dimensions.get("window").width - 40} // Full width minus padding
        height={200}
        chartConfig={{
          backgroundColor: "#fff",
          backgroundGradientFrom: "#f0f0f0",
          backgroundGradientTo: "#fff",
          decimalPlaces: 2, // No decimals for ppm
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // Label colors
          style: { borderRadius: 16 },
        }}
        bezier // This makes the line curvy/smooth
        style={{ borderRadius: 16 }}
      />
    </View>
  );
};