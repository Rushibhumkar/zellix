import { View } from "react-native";
import React from "react";
import SkeletonView from "../../myComponents/SkeletonView/SkeletonView";
import { shadow1 } from "../../const/globalStyle";

const SkeletonLoadingMeeting = () => {
  return (
    <>
      {[...new Array(6)].map((el, i) => {
        return <View key={i} style={{ paddingHorizontal: 20, marginTop: 20 }}>
          <View
            style={{
              ...shadow1,
              width: "100%",
              backgroundColor: "white",
              // marginVertical: 10,
              borderRadius: 5,
              padding: 15,
            }}
          >
            <SkeltonItem />
          </View>
        </View>
      })}
    </>
  );
};

export default SkeletonLoadingMeeting;

const SkeltonItem = () => {
  return (
    <View
      style={{
        gap: 40,
        alignItems: "baseline",
        flexDirection: "row",
        marginTop: 10,
        // justifyContent: 'space-between'
      }}
    >
      <View style={{ flex: 1, gap: 10 }}>
        <List />
        <List />
      </View>
      <View>
        <List />
      </View>
      <View style={{ flex: 1, gap: 10, alignItems: 'flex-end' }}>
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
