import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import CustomText from '../../../myComponents/CustomText/CustomText'
import CustomBtn from '../../../myComponents/CustomBtn/CustomBtn'
import { color } from '../../../const/color'
import DropdownRNE from '../../../myComponents/DropdownRNE/DropdownRNE'

interface TLeaveAppRemark {
    onPressSubmit: () => void;
    onPressCancel: () => void;
    onChangeText: (v: string) => void;
    heading: string;
    isDropDown?: {
        arrOfObj: [];
        onChange: (v: string) => void;
    };
}
const LeaveAppRemark = ({
    heading,
    onPressSubmit,
    onPressCancel,
    onChangeText,
    isDropDown
}: TLeaveAppRemark) => {
    return (
        <View>
            <View
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 15,
                    justifyContent: 'space-between',
                    marginBottom: 15
                }}
            >
                <CustomText
                    fontSize={18}
                    fontWeight='600'
                    style={{ textTransform: 'capitalize' }}
                >{heading ?? '---------'}
                </CustomText>
                <CustomBtn
                    title='Cancel'
                    containerStyle={{ backgroundColor: color.dullRed }}
                    textStyle={{
                        fontSize: 12,
                        fontWeight: 700,
                    }}
                    onPress={onPressCancel}
                />
            </View>

            <View
                style={{ marginBottom: 25 }}
            >
                {isDropDown && <DropdownRNE
                    label='Status'
                    containerStyle={{ marginBottom: 15 }}
                    arrOfObj={isDropDown?.arrOfObj}
                    mode='modal'
                    onChange={isDropDown?.onChange}
                    isSearch
                />}
                <CustomText
                    fontSize={16}
                    fontWeight='400'
                    marginBottom={7}
                >Remark
                </CustomText>
                <TextInput
                    style={{
                        borderWidth: 0.5,
                        borderColor: '#DCDCDC',
                        borderRadius: 4,
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        width: '100%',
                        height: 100,
                    }}
                    multiline={true}
                    textAlignVertical='top'
                    placeholder='Type here'
                    onChangeText={onChangeText}
                />
            </View>
            <CustomBtn
                title='Submit'
                containerStyle={{ alignSelf: 'flex-start', paddingHorizontal: 25 }}
                onPress={onPressSubmit}

            />
        </View>
    )
}

export default LeaveAppRemark

const styles = StyleSheet.create({})