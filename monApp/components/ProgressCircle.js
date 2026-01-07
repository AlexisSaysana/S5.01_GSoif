import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const ProgressCircle = ({
  size,
  strokeWidth,
  progress,
  children,
  color,
  backgroundColor,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2* Math.PI * radius;
  const strokeDashoffset =
    circumference - progress * circumference;

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle
          stroke={backgroundColor}
          fill='none'
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />

        {/* Cercle de progression */}
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap='butt'
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>

      {/* Contenu centré */}
      <View style={styles.centerContainer}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ProgressCircle;