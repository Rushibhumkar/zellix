import { View } from "react-native";
import React from "react";
import { shadowPrimaryColor } from "../../../const/globalStyle";
import SkeletonView from "../../../myComponents/SkeletonView/SkeletonView";

const SkeletonLoadingEvents = () => {
  return (
    <>
      {[...new Array(6)].map((el, i) => {
        return (
          <View key={i} style={{ paddingHorizontal: 20, marginTop: 20 }}>
            <View
              style={{
                ...shadowPrimaryColor,
                width: "100%",
                backgroundColor: "white",
                // marginVertical: 10,
                borderRadius: 14,
                padding: 15,
              }}
            >
              <SkeltonItem />
            </View>
          </View>
        );
      })}
    </>
  );
};

export default SkeletonLoadingEvents;

const SkeltonItem = () => {
  return (
    <View
      style={{
        gap: 40,
        alignItems: "baseline",
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
      }}
    >
      <View style={{ flex: 1, gap: 10, width: "28%" }}>
        <List />
        {/* <List /> */}
      </View>
      <View style={{ flex: 1, gap: 10, width: "32%" }}>
        <List />
        {/* <List /> */}
      </View>
      <View style={{ flex: 1, gap: 10, width: "40%" }}>
        <List />
        <List />
      </View>
    </View>
  );
};
const List = () => {
  return (
    <SkeletonView
      wrapperStyle={{
        width: 60,
        height: 10,
        borderRadius: 15,
      }}
    />
  );
};
