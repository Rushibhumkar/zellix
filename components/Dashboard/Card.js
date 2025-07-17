import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSelector } from "react-redux";
import { color } from "../../const/color";
import { shadowLight } from "../../const/globalStyle";
import { selectUser } from "../../redux/userSlice";
import { useNavigation } from "@react-navigation/native";
import { routeBooking, routeLead, routeMeeting } from "../../utils/routes";
import SkeletonView from "../../myComponents/SkeletonView/SkeletonView";

const Card = ({
  item,
  loading
}) => {
  // const { team, lead, bookings, meeting, allUsers } = useSelector(selectUser)
  const { navigate } = useNavigation()

  const SingleCard = ({
    count,
    title,
    onPress,
    isLoading,
  }) => {
    return <>
      {!isLoading ? <TouchableOpacity
        style={styles.cardcontainer}
        onPress={onPress}
        activeOpacity={0.5}
      >
        <Text
          style={{
            fontSize: 24,
            textAlign: "center",
            color: "#000000",
            fontWeight: "900",
          }}
        >
          {count}
        </Text>
        <Text
          style={{
            fontSize: 15,
            textAlign: "center",
            color: "#131313",
            fontWeight: "600",
          }}
        >
          {title}
        </Text>
      </TouchableOpacity> :
        <TouchableOpacity
          style={[styles.cardcontainer, { justifyContent: 'center' }]}
          activeOpacity={1}
        >
          <SkeletonRow />
        </TouchableOpacity>
      }
    </>
  }

  return (
    <>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 5
      }}>
        <SingleCard
          count={item?.leads ?? 0}
          title={'Leads'}
          onPress={() => navigate(routeLead.leadNavigator)}
          isLoading={loading}
        />
        <SingleCard
          count={item?.meetings ?? 0}
          title={'Meeting'}
          onPress={() => navigate(routeMeeting.MeetingsNavigator)}
          isLoading={loading}
        />
      </View>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%'
      }}>
        <SingleCard
          count={item?.bookings ?? 0}
          title={'Bookings'}
          onPress={() => navigate(routeBooking.bookingNavigator)}
          isLoading={loading}
        />
        <SingleCard
          count={item?.users ?? 0}
          title={'Employees'}
          onPress={() => navigate('usermanagement')}
          isLoading={loading}
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  cardcontainer: {
    padding: 10,
    backgroundColor: color.paleGrey,
    ...shadowLight,
    borderRadius: 5,
    borderWidth: 0.8,
    borderColor: color.saffronMango,
    width: '48%',
    // minHeight: 65
  },
});

export default Card;


const SkeletonRow = () => {
  return (
    <View style={{ justifyContent: "center", alignItems: "center", paddingBottom: 10 }}>
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
}