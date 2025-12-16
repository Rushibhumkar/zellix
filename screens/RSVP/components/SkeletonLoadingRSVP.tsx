import { View } from "react-native";
import React from "react";
import { shadowPrimaryColor } from "../../../const/globalStyle";
import SkeletonView from "../../../myComponents/SkeletonView/SkeletonView";

const SkeletonLoadingRSVP = () => {
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

export default SkeletonLoadingRSVP;

const SkeltonItem = () => {
  return (
    <View
      style={{
        gap: 40,
        alignItems: "baseline",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <View style={{ flex: 1, gap: 10 }}>
        <List />
        <List />
      </View>
      <View style={{ flex: 1, gap: 10 }}>
        <List />
        <List />
      </View>
      <View style={{ flex: 1, gap: 10 }}>
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
