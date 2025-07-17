import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { color } from "../../../const/color";

interface TTabButton {
  onTabPress?: (v: number) => void;
  activeTab?: number;
  setActiveTab?: (v: number) => void;
}

const TabButton = ({ onTabPress, activeTab, setActiveTab }: TTabButton) => {
  // const [activeTab, setActiveTab] = useState(1);

  const handlePress = (tabIndex) => {
    setActiveTab && setActiveTab(tabIndex);
    if (onTabPress) {
      onTabPress(tabIndex);
    }
  };
  useEffect(() => {
    setActiveTab && setActiveTab(activeTab);
  }, [activeTab]);

  return (
    <View style={styles.container}>
      <ScrollView horizontal>
        <Pressable
          style={[styles.tab, activeTab === 1 && styles.activeTab]}
          onPress={() => handlePress(1)}
        >
          <Text
            style={[styles.tabText, activeTab === 1 && styles.activeTabText]}
          >
            Lead Info
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === 2 && styles.activeTab]}
          onPress={() => handlePress(2)}
        >
          <Text
            style={[styles.tabText, activeTab === 2 && styles.activeTabText]}
          >
            User Info
          </Text>
        </Pressable>

        <Pressable
          style={[styles.tab, activeTab === 3 && styles.activeTab]}
          onPress={() => handlePress(3)}
        >
          <Text
            style={[styles.tabText, activeTab === 3 && styles.activeTabText]}
          >
            Logs Info
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 4 && styles.activeTab]}
          onPress={() => handlePress(4)}
        >
          <Text
            style={[styles.tabText, activeTab === 4 && styles.activeTabText]}
          >
            Meeting Info
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    alignSelf: "center",
    marginTop: 10,
    borderRadius: 10,

    // padding: 20,
    // marginVertical: 20,
  },
  tab: {
    // flex: 1,
    // paddingVertical: 10,
    // marginHorizontal: 5,
    backgroundColor: color.gray,
    flex: 1,
    // borderRadius: 5,
    alignItems: "center",
    padding: 5,
  },
  activeTab: {
    backgroundColor: color.saffronMango,
  },
  tabText: {
    fontWeight: "500",
    // color: '#fff',
  },
  activeTabText: {
    // color: '#fff',
    fontWeight: "500",
  },
});

export default TabButton;
