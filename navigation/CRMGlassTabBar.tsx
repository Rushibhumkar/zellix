import React, { useEffect, useRef, useState } from "react";
import { Keyboard, Platform, StyleSheet, View, type ViewProps } from "react-native";
import type Svg from "react-native-svg";
import { requireNativeView, requireOptionalNativeModule } from "expo";
import { BottomTabBar, type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import DashboardIcon from "../assets/svg/DashboardIcon";
import DataIcon from "../assets/svg/Lead";
import MeetingIcon from "../assets/svg/MeetingIcon";
import EventsIcon from "../assets/svg/RsvpInfocus";
import ReportIcon from "../assets/svg/ReportInfocus";

const moduleName = "ZellixGlassTabs";
const nativeModule = Platform.OS === "ios"
  ? requireOptionalNativeModule<{ isSupported(): boolean }>(moduleName)
  : null;

type TabItem = { key: string; title: string; symbol: string; iconData?: string };
type GlassTabProps = ViewProps & {
  tabs: TabItem[];
  selectedKey: string;
  onTabSelect: (event: { nativeEvent: { key: string } }) => void;
};

const GlassTabs = nativeModule?.isSupported()
  ? requireNativeView<GlassTabProps>(moduleName)
  : null;

const tabDisplay: Record<string, Omit<TabItem, "key">> = {
  dashboard: { title: "Dashboard", symbol: "square.grid.2x2" },
  allLead2: { title: "Data", symbol: "person.2" },
  MeetingsNavigator: { title: "Meetings", symbol: "calendar" },
  RSVPNavigator: { title: "Events", symbol: "calendar.badge.clock" },
  ReportsNavigator: { title: "Reports", symbol: "chart.bar" },
};

const glyphs = {
  dashboard: { Icon: DashboardIcon, viewBox: "17 6 24 24" },
  allLead2: { Icon: DataIcon, viewBox: "17 4 24 24" },
  MeetingsNavigator: { Icon: MeetingIcon, viewBox: "17 4 24 24" },
  RSVPNavigator: { Icon: EventsIcon, viewBox: "17 4 24 24" },
  ReportsNavigator: { Icon: ReportIcon, viewBox: "20 5 24 24" },
};

function TabGlyph({ glyph, onCapture }: {
  glyph: (typeof glyphs)[keyof typeof glyphs];
  onCapture: (data: string) => void;
}) {
  const ref = useRef<Svg | null>(null);
  const { Icon, viewBox } = glyph;
  return (
    <Icon
      ref={ref}
      width={24}
      height={24}
      viewBox={viewBox}
      onLayout={() => ref.current?.toDataURL(onCapture)}
    />
  );
}

export const hasCRMGlassTabs = GlassTabs !== null;
export const crmGlassTabHeight = (bottomInset: number) => 64 + bottomInset;

export default function CRMGlassTabBar(props: BottomTabBarProps) {
  const { state, navigation, insets, descriptors } = props;
  const [keyboardVisible, setKeyboardVisible] = useState(() => Keyboard.isVisible());
  const [icons, setIcons] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!GlassTabs) return;
    const show = Keyboard.addListener("keyboardWillShow", () => setKeyboardVisible(true));
    const hide = Keyboard.addListener("keyboardWillHide", () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (!GlassTabs) return <BottomTabBar {...props} />;
  const activeRoute = state.routes[state.index];
  if (keyboardVisible && descriptors[activeRoute.key]?.options.tabBarHideOnKeyboard) return null;

  return (
    <>
      <View pointerEvents="none" accessibilityElementsHidden style={styles.glyphCapture}>
        {Object.entries(glyphs).map(([name, glyph]) => !icons[name] && (
          <TabGlyph key={name} glyph={glyph} onCapture={(data) => {
            if (data) setIcons((previous) => previous[name] === data ? previous : { ...previous, [name]: data });
          }} />
        ))}
      </View>
      <GlassTabs
      style={[styles.bar, { height: crmGlassTabHeight(insets.bottom) }]}
      tabs={state.routes.map((route) => ({
        key: route.key,
        ...(tabDisplay[route.name] || { title: route.name, symbol: "circle" }),
        iconData: icons[route.name],
      }))}
      selectedKey={activeRoute.key}
      onTabSelect={({ nativeEvent }) => {
        const route = state.routes.find((item) => item.key === nativeEvent.key);
        if (!route) return;
        const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
        if (route.key !== activeRoute.key && !event.defaultPrevented) {
          navigation.navigate(route.name, route.params);
        }
      }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bar: { position: "absolute", bottom: 0, left: 0, right: 0 },
  glyphCapture: { position: "absolute", left: 0, bottom: 0, opacity: 0 },
});
