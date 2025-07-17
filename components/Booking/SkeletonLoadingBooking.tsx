import { Text, StyleSheet, View } from "react-native";
import React, { Component } from "react";
import SkeletonView from "../../myComponents/SkeletonView/SkeletonView";
import { shadow1 } from "../../const/globalStyle";

const SkeletonLoadingBooking = () => {
  return (
    <View style={{ paddingHorizontal: 20, marginTop: 10 }}>
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
          <SKeletonItem />
        </View>
      })}
    </View>
  );
};
export default SkeletonLoadingBooking;

const styles = StyleSheet.create({});

const SKeletonItem = () => {
  return (
    <View
      style={{
        gap: 20,
        alignItems: "baseline",
        flexDirection: "row",
        marginTop: 10,
      }}
    >
      <SkeletonView
        wrapperStyle={{
          width: 20,
          height: 10,
          borderRadius: 15,
        }}
      />
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1.5
      }}>
        <Skeleton />
        <Skeleton />
      </View>
      <View style={{ flex: 1, gap: 10, alignItems: 'flex-end' }}>
        <SkeletonView
          wrapperStyle={{
            width: 80,
            height: 10,
            borderRadius: 15,
          }}
        />
        <SkeletonView
          wrapperStyle={{
            width: 80,
            height: 10,
            borderRadius: 15,
          }}
        />
      </View>
    </View>
  );
};

const Skeleton = () => {
  return (
    <SkeletonView
      wrapperStyle={{
        width: 50,
        height: 10,
        borderRadius: 15,
      }}
    />
  );
};
