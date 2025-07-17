import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { color } from '../../const/color'
import CustomText from '../../myComponents/CustomText/CustomText'
import { popUpConfToast } from '../../utils/toastModalByFunction'

const PleaseWait = () => {
    return (
        <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            gap: 25,
        }}>
            <ActivityIndicator
                color={color.saffronMango}
                size={'large'}
            />
            <CustomText
                fontSize={18}
                fontWeight='700'
                color={color.saffronMango}
            >Please Wait...</CustomText>
            <TouchableOpacity
                onPress={() => popUpConfToast.popUpClose()}
                style={{
                    width: 10,
                    height: 10,
                }}
            >
                <Text>.</Text>
            </TouchableOpacity>
        </View>
    )
}

export default PleaseWait

const styles = StyleSheet.create({})