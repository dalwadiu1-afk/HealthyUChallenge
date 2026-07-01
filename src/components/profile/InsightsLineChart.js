import React from 'react';
import { View, Dimensions, ScrollView } from 'react-native';
import Svg, { Polyline, Circle, Line, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');

export default function InsightsLineChart({ data = [], target = 0 }) {
  const chartWidth = width - 60;
  const chartHeight = 180;

  const padding = 20;

  const maxValue = Math.max(...data.map(d => d.value), target, 1);

  const stepX = (chartWidth - padding * 2) / Math.max(data.length - 1, 1);

  const scaleY = value =>
    chartHeight - padding - (value / maxValue) * (chartHeight - padding * 2);

  const points = data
    .map((d, i) => {
      const x = padding + i * stepX;
      const y = scaleY(d.value);
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <ScrollView horizontal>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Target Line */}
        <Line
          x1={padding}
          x2={chartWidth - padding}
          y1={scaleY(target)}
          y2={scaleY(target)}
          stroke="#F59E0B"
          strokeDasharray="6 4"
          strokeWidth="2"
        />

        {/* Main Line */}
        <Polyline
          points={points}
          fill="none"
          stroke="#22C55E"
          strokeWidth="3"
        />

        {/* Dots */}
        {data.map((d, i) => {
          const x = padding + i * stepX;
          const y = scaleY(d.value);

          return <Circle key={i} cx={x} cy={y} r="4" fill="#22C55E" />;
        })}

        {/* Labels (optional bottom) */}
        {data.map((d, i) => {
          const x = padding + i * stepX;
          return (
            <SvgText
              key={i}
              x={x}
              y={chartHeight - 5}
              fontSize="10"
              fill="#999"
              textAnchor="middle"
            >
              {d.label}
            </SvgText>
          );
        })}
      </Svg>
    </ScrollView>
  );
}
