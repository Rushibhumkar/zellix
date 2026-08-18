import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { AntDesign, Feather } from "@expo/vector-icons";
import { color } from "../../const/color";
import CustomText from "../../myComponents/CustomText/CustomText";

interface TPinnedRowItem {
  id: string;
  title: string;
  subtitle?: string;
}

interface TPinnedRow {
  items: TPinnedRowItem[];
  onPressItem: (id: string) => void;
  onUnpin: (id: string) => void;
}

const PinnedRow = ({ items, onPressItem, onUnpin }: TPinnedRow) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Feather name="bookmark" size={13} color={color.mainTxtColor} />
        <CustomText style={styles.headerText}>Pinned</CustomText>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 6 }}
      >
        {items.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.chip}
            activeOpacity={0.7}
            onPress={() => onPressItem(item.id)}
          >
            <View style={styles.chipTextWrapper}>
              <CustomText style={styles.chipTitle} numberOfLines={1}>
                {item.title}
              </CustomText>
              {!!item.subtitle && (
                <CustomText style={styles.chipSubtitle} numberOfLines={1}>
                  {item.subtitle}
                </CustomText>
              )}
            </View>

            <TouchableOpacity
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              onPress={() => onUnpin(item.id)}
              style={styles.unpinBtn}
            >
              <AntDesign name="close" size={12} color="#7A869A" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default PinnedRow;

const styles = StyleSheet.create({
  wrapper: {
    marginHorizontal: 12,
    marginTop: 10,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "600",
    color: color.mainTxtColor,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FF",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginRight: 8,
    maxWidth: 170,
  },
  chipTextWrapper: {
    flexShrink: 1,
  },
  chipTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: color.mainTxtColor,
  },
  chipSubtitle: {
    fontSize: 10,
    color: "#64748B",
    marginTop: 1,
  },
  unpinBtn: {
    marginLeft: 6,
  },
});
