import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native'
import React from 'react'
import CustomText from '../../myComponents/CustomText/CustomText'
import { Ionicons } from '@expo/vector-icons';

interface TTitleHRM {
    title?: string;
    containerStyle?: StyleProp<ViewStyle>;
    marginBottom?: number;
    marginTop?: number;
    onPressFilter?: () => void;
}
const TitleHRM = ({
    title,
    containerStyle,
    marginBottom,
    marginTop,
    onPressFilter
}: TTitleHRM) => {
    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: 3,
                marginBottom,
                marginTop
            }}
        >
            <View
                style={[{
                    borderBottomWidth: 1,
                    width: '70%',
                },
                    containerStyle
                ]}
            >
                <CustomText
                    fontSize={16}
                    fontWeight='600'
                    style={{
                        fontStyle: 'italic'
                    }}
                >
                    {title ?? '  Employees on Leave Today'}
                </CustomText>
            </View>
            {!!onPressFilter && <TouchableOpacity
                onPress={onPressFilter}
                style={{
                    paddingHorizontal: 10
                }}
            >
                <Ionicons name='filter' size={20} />
            </TouchableOpacity>}
        </View>
    )
}

export default TitleHRM

const styles = StyleSheet.create({})