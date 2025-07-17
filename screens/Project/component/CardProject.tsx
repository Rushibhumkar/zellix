import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { shadow1 } from '../../../const/globalStyle'
import CustomText from '../../../myComponents/CustomText/CustomText'
import moment from 'moment'

const CardProject = ({
    item,
    onPress,
    index,
    selected,
    bgColor,
    onLongPress,
    onPressClaim
}) => {
    return (
        <TouchableOpacity
            key={index}
            // activeOpacity={isSubSup ? 0.9 : 1}
            style={[
                styles.mainlistcontainer,
                {
                    backgroundColor: selected ? "rgba(252, 244, 227, 1)" : bgColor ? bgColor : 'white'
                },
            ]}
            onPress={onPress}
            onLongPress={onLongPress}
        >
            <View style={{ flexDirection: "row" }}>
                <View style={{ width: "45%", paddingEnd: 3 }}>
                    <Text
                        numberOfLines={1}
                        style={{
                            color: "#000000",
                            // fontWeight: "700",
                            fontSize: 16,
                            textTransform: "capitalize",
                        }}
                    >
                        {item?.source || 'N/A'}
                    </Text>
                    <Text
                        numberOfLines={1}
                        style={{
                            color: "#000000",
                            fontWeight: "400",
                            marginTop: 5,
                            textTransform: "capitalize",
                        }}
                    >
                        {item?.projectName || 'N/A'}
                    </Text>
                </View>
                <View style={{ width: "40%", paddingEnd: 3, }}>
                    <Text
                        numberOfLines={1}
                        style={{
                            color: "#000000",
                            fontWeight: "400",
                            fontSize: 15,
                            textTransform: "capitalize",
                        }}
                    >
                        {item?.pageName || 'N/A'}
                    </Text>
                    <Text
                        numberOfLines={1}
                        style={{
                            color: "#000000",
                            fontWeight: "400",
                            fontSize: 15,
                            textTransform: "capitalize",
                            marginTop: 5,
                        }}
                    >
                        {moment(item?.createdAt).format('DD/MM/YYYY') || "N/A"}
                    </Text>
                </View>
                <View style={{ width: "15%", paddingEnd: 3, alignItems: 'center' }}
                >
                    <Text
                        numberOfLines={1}
                        style={{
                            color: "#000000",
                            fontWeight: "400",
                            fontSize: 15,
                            textTransform: "capitalize",
                        }}
                    >
                        {item?.totalLeads || '0'}
                    </Text>
                    <Text
                        numberOfLines={1}
                        style={{
                            color: "#000000",
                            fontWeight: "400",
                            fontSize: 15,
                            textTransform: "capitalize",
                            marginTop: 5,
                        }}
                    >
                        {item?.totalMembers || "0"}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

export default CardProject

export const HeaderProjectList = () => {
    return (
        <View style={styles.headingContainer}>
            <View style={{ width: "45%", paddingEnd: 3 }}>
                <CustomText color='white' marginBottom={5}>Source</CustomText>
                <CustomText color='white'>Project Name</CustomText>
            </View>
            <View style={{ width: "40%", paddingEnd: 3 }}>
                <CustomText color='white' marginBottom={5}>Page Name</CustomText>
                <CustomText color='white'>Creation Date</CustomText>
            </View>
            <View style={{ width: "15%", paddingEnd: 3 }}>
                <CustomText
                    color='white'
                    marginBottom={5}
                    numberOfLines={1}
                >Leads</CustomText>
                <CustomText
                    color='white'
                    numberOfLines={1}
                >
                    Members</CustomText>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    mainlistcontainer: {
        marginTop: 25,
        borderWidth: 1,
        padding: 13,
        borderRadius: 10,
        borderColor: "#FFC857",
        marginHorizontal: 20,
        ...shadow1,
    },
    headingContainer: {
        backgroundColor: "#3E3E3E",
        flexDirection: "row",
        padding: 10,
        borderRadius: 11,
        marginBottom: -8,
        marginTop: 25,
        marginHorizontal: 20,
        // justifyContent: "space-between",
    },
})