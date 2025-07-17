import { View } from "react-native";
import React from "react";
import SkeletonView from "../../myComponents/SkeletonView/SkeletonView";
import { shadow1 } from "../../const/globalStyle";

const SkeletonLoadingDashboard = () => {
  return (
    <>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 25,
        }}
      >
        <View
          style={{
            ...shadow1,
            width: 145,
            height: 80,
            backgroundColor: "white",
            marginTop: 25,
            alignItems: "center",
            borderRadius: 5,
            padding: 10,
          }}
        >
          <SkeletonRow />
        </View>
        <View
          style={{
            ...shadow1,
            width: 145,
            height: 80,
            backgroundColor: "white",
            marginTop: 25,
            alignItems: "center",
            borderRadius: 5,
            padding: 10,
          }}
        >
          <SkeletonRow />
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingHorizontal: 25,
        }}
      >
        <View
          style={{
            ...shadow1,
            width: 145,
            height: 80,
            backgroundColor: "white",
            marginTop: 15,
            borderRadius: 5,
            alignItems: "center",
            padding: 10,
          }}
        >
          <SkeletonRow />
        </View>
        <View
          style={{
            ...shadow1,
            width: 145,
            height: 80,
            backgroundColor: "white",
            marginTop: 15,
            alignItems: "center",
            borderRadius: 5,
            padding: 10,
          }}
        >
          <SkeletonRow />
        </View>
      </View>
      <View
        style={{
          paddingHorizontal: 25,
          marginTop: 15,
        }}
      >
        <View
          style={{
            ...shadow1,
            width: "100%",
            backgroundColor: "white",
            marginVertical: 10,
            borderRadius: 5,
            padding: 30,
          }}
        >
          <SkeletonView
            wrapperStyle={{
              width: 260,
              height: 10,
              borderRadius: 15,
            }}
          />
          <View
            style={{
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "row",
              marginTop: 10
            }}
          >
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </View>
        </View>

        <View
          style={{
            ...shadow1,
            width: "100%",
            backgroundColor: "white",
            marginVertical: 10,
            borderRadius: 5,
            padding: 30,
          }}
        >
          <SkeletonView
            wrapperStyle={{
              width: 260,
              height: 10,
              borderRadius: 15,
            }}
          />
          <View
            style={{
              justifyContent: "space-between",
              alignItems: "center",
              flexDirection: "row",
              marginTop: 10
            }}
          >
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </View>
        </View>
      </View>
      <View
        style={{
          marginHorizontal: 25,
          justifyContent: "center",
          alignItems: "center",
          marginTop: 20
        }}
      >
        <SkeletonView
          wrapperStyle={{
            width: 300,
            height: 10,
            borderRadius: 15,
          }}
        />
      </View>
    </>
  );
};

export default SkeletonLoadingDashboard;



const SkeletonRow = () => {
  return (
    <View style={{ justifyContent: "center", alignItems: "center" }}>
      <SkeletonView
        wrapperStyle={{
          width: 20,
          height: 20,
          borderRadius: 15,
        }}
      />
      <SkeletonView
        wrapperStyle={{
          width: 80,
          height: 10,
          borderRadius: 15,
          marginTop: 10,
        }}
      />
    </View>
  );
};
