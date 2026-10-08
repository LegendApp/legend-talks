import { SceneMotionView } from "@legend-apps/presentation";
import { useState } from "react";
import { Text, View } from "react-native";
import { AnimatedTitle } from "./AnimatedTitle";
import { MovingTitle } from "./MovingTitle";

const titleTextStyle = { color: "#f8fafc", fontFamily: "Helvetica Neue", fontSize: 72, lineHeight: 90, fontWeight: "600", letterSpacing: -1.8 } as const;
const maximumMetricWidth = 540;
const metricGap = 16;

export function BenchmarkTitle({ title, metric, showMetric = true, animateEntrance = false }: {
  title: string; metric?: string; showMetric?: boolean; animateEntrance?: boolean;
}) {
  const [titleWidth, setTitleWidth] = useState(0);
  const [measurement, setMeasurement] = useState({ metric, width: maximumMetricWidth });
  const metricWidth = metric ? measurement.metric === metric ? measurement.width : maximumMetricWidth : 0;
  const gap = metric ? metricGap : 0;
  const visibleMetric = !!metric && showMetric;
  return <View accessible accessibilityRole="header" accessibilityLabel={visibleMetric ? `${title} · ${metric}` : title}
    style={{ width: 1696, height: 90, marginBottom: 36, alignSelf: "center", alignItems: "center" }}>
    <SceneMotionView pose={{ x: visibleMetric ? 0 : (metricWidth + gap) / 2 }} duration={650}
      style={{ flexDirection: "row", alignItems: "center" }}>
      <MovingTitle>
        <View>
          <Text accessible={false} numberOfLines={1} onLayout={event => setTitleWidth(event.nativeEvent.layout.width)}
            style={[titleTextStyle, { opacity: animateEntrance ? 0 : 1 }]}>{title}</Text>
          {animateEntrance && titleWidth > 0 && <View style={{ position: "absolute", top: 0, left: 0 }}>
            <AnimatedTitle effect="stretch-release" fontSize={72} width={titleWidth} wrap={false}
              textStyle={titleTextStyle}>{title}</AnimatedTitle>
          </View>}
        </View>
      </MovingTitle>
      <View style={{ width: metricWidth, height: 90, marginLeft: gap, overflow: "hidden" }}>
        <SceneMotionView initialPose={{ y: 90, opacity: 0 }}
          pose={{ y: visibleMetric ? 0 : 90, opacity: visibleMetric ? 1 : 0 }} duration={650} hidden={!visibleMetric}>
          <Text numberOfLines={1} style={titleTextStyle}>{metric ? `· ${metric}` : ""}</Text>
        </SceneMotionView>
      </View>
    </SceneMotionView>
    {metric && <View pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
      style={{ position: "absolute", top: 0, left: 0, width: maximumMetricWidth, alignItems: "flex-start", opacity: 0 }}>
      <Text accessible={false} numberOfLines={1} style={titleTextStyle}
        onLayout={event => setMeasurement({ metric, width: Math.ceil(event.nativeEvent.layout.width) })}>{`· ${metric}`}</Text>
    </View>}
  </View>;
}
