import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import SkeletonView from '../SkeletonView/SkeletonView'
import { shadow1 } from '../../const/globalStyle'

const BookingMeetingLoader = () => {
    return (
        <View>
            <View
                style={{
                    ...shadow1,
                    // width: "100%",
                    backgroundColor: "white",
                    marginVertical: 10,
                    borderRadius: 5,
                    padding: 20,
                    marginHorizontal: 20
                }}
            >
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 15
                }}>
                    <SkeletonView
                        wrapperStyle={{
                            width: 100,
                            height: 25,
                            borderRadius: 10
                        }}
                    />
                    <SkeletonView
                        wrapperStyle={{
                            width: 140,
                            height: 30,
                            borderRadius: 10
                        }}
                    />
                </View>
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
    )
}

export default BookingMeetingLoader


const SkeletonRow = () => {
    return (
        <View style={{ justifyContent: "center", alignItems: "center", paddingBottom: 20 }}>
            <SkeletonView
                wrapperStyle={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
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
