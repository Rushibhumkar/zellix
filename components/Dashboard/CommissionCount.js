import React from "react";
import { StyleSheet, View } from "react-native";
import * as Progress from 'react-native-progress';
import { shadow1 } from "../../const/globalStyle";
import CustomText from "../../myComponents/CustomText/CustomText";

const CommissionCount = () => {

  return (
    <View
      style={{
        margin: 20,
        ...shadow1,
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
      }}
    >
      <View>
        <View>
          <CustomText
            fontSize={20}
            fontWeight="700"
            marginBottom={15}
          >Bookings</CustomText>
        </View>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <View style={styles.center}>
            <Progress.Circle
              size={60}
              indeterminate={false}
              progress={0.2}
              borderWidth={0}
              color={'rgb(27,195,36)'}
              thickness={8}
              showsText={true}
              textStyle={styles.textProg}
            // borderColor={20}
            />
            <CustomText>Approved</CustomText>
          </View>
          <View style={styles.center}>
            <Progress.Circle
              size={60}
              indeterminate={false}
              progress={0.4}
              borderWidth={0}
              color={'rgb(207,0,1)'}
              thickness={8}
              showsText={true}
              textStyle={styles.textProg}
            // borderColor={20}
            />
            <CustomText>Rejected</CustomText>
          </View>
          <View style={styles.center}>
            <Progress.Circle
              size={60}
              indeterminate={false}
              progress={0.9}
              borderWidth={0}
              color={'rgb(254,219,50)'}
              thickness={8}
              showsText={true}
              textStyle={styles.textProg}
            // borderColor={20}
            />
            <CustomText >Pending</CustomText>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    gap: 5,
  },
  textProg: {
    color: 'black',
    fontSize: 13,
    fontWeight: '400'
  }
});

export default CommissionCount;

