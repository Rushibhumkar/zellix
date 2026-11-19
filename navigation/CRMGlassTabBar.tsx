import React, { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, Platform, StyleSheet, View, type ViewProps } from "react-native";
import type Svg from "react-native-svg";
import { requireNativeView, requireOptionalNativeModule } from "expo";
import { BottomTabBar, type BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { CommonActions } from "@react-navigation/native";
import DashboardIcon from "../assets/svg/DashboardIcon";
import DataIcon from "../assets/svg/Lead";
import MeetingIcon from "../assets/svg/MeetingIcon";
import EventsIcon from "../assets/svg/RsvpInfocus";
import ReportIcon from "../assets/svg/ReportInfocus";

const moduleName = "ZellixGlassTabs";
const nativeModule = Platform.OS === "ios"
  ? requireOptionalNativeModule<{ isSupported(): boolean; selectionProtocolVersion?(): number }>(moduleName)
  : null;

type TabItem = { key: string; title: string; symbol: string; iconData?: string };
type GlassTabProps = ViewProps & {
  tabs: TabItem[];
  selectedKey: string;
  selectionAcknowledgement: number;
  selectionState?: { key: string; requestId: number };
  onTabSelect: (event: { nativeEvent: { key: string; requestId?: number } }) => void;
};

const GlassTabs = nativeModule?.isSupported()
  ? requireNativeView<GlassTabProps>(moduleName)
  : null;
const usesAtomicSelection = nativeModule?.selectionProtocolVersion?.() === 2;

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
  const [selectionAcknowledgement, setSelectionAcknowledgement] = useState(0);
  const [resolvedSelection, setResolvedSelection] = useState<{ key: string; requestId: number }>();
  const pendingPress = useRef<{ key: string; requestId?: number } | undefined>(undefined);
  const pressFrame = useRef<number | undefined>(undefined);
  const currentProps = useRef(props);
  currentProps.current = props;
  const tabs = useMemo(() => state.routes.map((route) => ({
    key: route.key,
    ...(tabDisplay[route.name] || { title: route.name, symbol: "circle" }),
    iconData: icons[route.name],
  })), [state.routes, icons]);

  useEffect(() => {
    if (!GlassTabs) return;
    const show = Keyboard.addListener("keyboardWillShow", () => setKeyboardVisible(true));
    const hide = Keyboard.addListener("keyboardWillHide", () => setKeyboardVisible(false));
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  useEffect(() => () => {
    if (pressFrame.current != null) cancelAnimationFrame(pressFrame.current);
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
      tabs={tabs}
      selectedKey={activeRoute.key}
      selectionAcknowledgement={selectionAcknowledgement}
      {...(usesAtomicSelection ? { selectionState: {
        key: activeRoute.key,
        requestId: resolvedSelection?.key === activeRoute.key ? resolvedSelection.requestId : 0,
      } } : {})}
      onTabSelect={({ nativeEvent }) => {
        pendingPress.current = nativeEvent;
        if (pressFrame.current != null) return;
        // Native glass gestures may emit several selections before JS gets a
        // frame. Navigate only to the latest target instead of visiting each.
        pressFrame.current = requestAnimationFrame(() => {
        pressFrame.current = undefined;
        const press = pendingPress.current;
        pendingPress.current = undefined;
        if (!press) return;
        const { navigation } = currentProps.current;
        const currentState = navigation.getState();
        try {
          const route = currentState.routes.find((item) => item.key === press.key);
          if (!route) return;
          const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
          if (route.key !== currentState.routes[currentState.index].key && !event.defaultPrevented) {
            navigation.dispatch({
              ...CommonActions.navigate({ name: route.name, merge: true }),
              target: currentState.key,
            });
          }
        } finally {
          if (press.requestId != null) {
            const resolved = navigation.getState();
            setResolvedSelection({ key: resolved.routes[resolved.index].key, requestId: press.requestId });
            setSelectionAcknowledgement(press.requestId);
          }
        }
        });
      }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  bar: { position: "absolute", bottom: 0, left: 0, right: 0 },
  glyphCapture: { position: "absolute", left: 0, bottom: 0, opacity: 0 },
});
