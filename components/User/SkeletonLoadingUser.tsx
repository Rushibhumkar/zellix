import { Text, View } from "react-native";
import React, { Component } from "react";
import SkeletonView from "../../myComponents/SkeletonView/SkeletonView";
import { shadow1 } from "../../const/globalStyle";

const SkeletonLoadingUser = () => {
  return (
    <View>
      <UserList />
      <UserList />
      <UserList />
      <UserList />
      <UserList />
      <UserList />
    </View>
  );
};

export default SkeletonLoadingUser;

const UserList = () => {
  return (
    <View
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
  );
};

const SKeletonItem = () => {
  return (
    <View
      style={{
        gap: 20,
        alignItems: "center",
        flexDirection: "row",
        marginTop: 10,
      }}
    >
      <SkeletonView
        wrapperStyle={{
          width: 15,
          height: 10,
          borderRadius: 15,
        }}
      />
      <View style={{ flexDirection: "column", flex: 1, gap: 10 }}>
        <Skeleton />
        <SkeletonView
          wrapperStyle={{
            width: 60,
            height: 10,
            borderRadius: 15,
          }}
        />
      </View>
      <View style={{ flexDirection: "column", flex: 1, gap: 10 }}>
        <Skeleton />
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
