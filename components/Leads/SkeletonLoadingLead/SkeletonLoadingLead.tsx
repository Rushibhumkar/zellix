import { Text, StyleSheet, View } from "react-native";
import React, { Component } from "react";
import SkeletonView from "../../../myComponents/SkeletonView/SkeletonView";
import { shadow1 } from "../../../const/globalStyle";


export default function SkeletonLoadingLead({
  isTeam
}: { isTeam: boolean }) {
  {
    const SkeltonItem = () => {
      return (
        <View
          style={{
            gap: 20,
            alignItems: "center",
            flexDirection: "row",
            // marginTop: 10,
          }}
        >
          <SkeletonView
            wrapperStyle={{
              width: 25,
              height: 15,
              borderRadius: 15,
            }}
          />
          <View style={{ flexDirection: "column", flex: 1, gap: 10 }}>
            {!isTeam && <SkeletonView
              wrapperStyle={{
                width: 40,
                height: 10,
                borderRadius: 15,
              }}
            />}
            <List />
          </View>
          <List />
          <List />
        </View>
      );
    };
    return (
      <View style={{ paddingHorizontal: 20, marginTop: isTeam ? 0 : 20 }}>
        {[...new Array(6)].map((el, i) => {
          return <View
            key={i}
            style={{
              ...shadow1,
              width: "100%",
              backgroundColor: "white",
              marginVertical: 10,
              borderRadius: 5,
              padding: 15,
            }}
          >
            <SkeltonItem />
          </View>
        })
        }
      </View>
    );
  }
}

const styles = StyleSheet.create({});


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
