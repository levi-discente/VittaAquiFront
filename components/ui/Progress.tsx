import React from "react";
import { View, StyleSheet } from "react-native";

type ProgressProps = {
  value?: number; // 0 a 100
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
  borderRadius?: number;
};

export const Progress: React.FC<ProgressProps> = ({
  value = 0,
  height = 8,
  backgroundColor = "#e5e7eb",
  fillColor = "#3b82f6",
  borderRadius = 9999,
}) => {
  return (
    <View style={[styles.root, { height, borderRadius, backgroundColor }]}>
      <View
        style={[
          styles.indicator,
          {
            width: `${value}%`,
            backgroundColor: fillColor,
            borderRadius,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: "100%",
    overflow: "hidden",
  },
  indicator: {
    height: "100%",
  },
});
