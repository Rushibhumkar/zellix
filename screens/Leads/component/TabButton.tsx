import React, { useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { color } from "../../../const/color";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { shadowPrimaryColor } from "../../../const/globalStyle";

interface TTabButton {
  onTabPress?: (v: number) => void;
  activeTab?: number;
  setActiveTab?: (v: number) => void;
}

const TabButton = ({ onTabPress, activeTab, setActiveTab }: TTabButton) => {
  const handlePress = (tabIndex: number) => {
    setActiveTab && setActiveTab(tabIndex);
    if (onTabPress) {
      onTabPress(tabIndex);
    }
  };

  useEffect(() => {
    setActiveTab && setActiveTab(activeTab);
  }, [activeTab]);

  const tabs = [
    { id: 1, label: "Overview" },
    { id: 2, label: "Notes" },
    { id: 3, label: "Logs" },
    { id: 4, label: "Meetings" },
    // { id: 3, label: "Timeline" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              activeTab === tab.id && styles.activeTab,
              activeTab === tab.id && styles.activeTabShadow,
            ]}
            onPress={() => handlePress(tab.id)}
            activeOpacity={0.6}
          >
            <CustomText
              style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText,
              ]}
            >
              {tab.label}
            </CustomText>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    borderRadius: 16,
    marginHorizontal: 12,
    marginTop: 16,
    marginBottom: 8,
    padding: 8,
    ...shadowPrimaryColor,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    // marginHorizontal: 4,
    minWidth: 100,
  },
  activeTab: {
    backgroundColor: color.saffronMango,
    ...Platform.select({
      ios: {
        shadowColor: color.saffronMango,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
        shadowColor: color.saffronMango,
      },
    }),
  },
  activeTabShadow: {
    ...Platform.select({
      ios: {
        shadowColor: color.saffronMango,
      },
    }),
  },
  tabText: {
    fontWeight: "600",
    fontSize: 14,
    color: color.strokeColor,
    textAlign: "center",
    ...Platform.select({
      ios: {
        fontFamily: "System",
        fontWeight: "600",
      },
      android: {
        fontFamily: "sans-serif-medium",
      },
    }),
  },
  activeTabText: {
    color: "#ffffffff",
    fontWeight: "700",
    ...Platform.select({
      ios: {
        fontFamily: "System",
        fontWeight: "700",
      },
      android: {
        fontFamily: "sans-serif-medium",
      },
    }),
  },
});

export default TabButton;
