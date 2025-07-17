import React from 'react';
import { ActivityIndicator, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { color } from '../../const/color';
import { shadow1 } from '../../const/globalStyle';

interface TCustomBtn {
    title: string;
    onPress: () => void;
    isLoading?: boolean;
    disabled?: boolean;
    containerStyle: StyleProp<ViewStyle>;
    textStyle?: StyleProp<TextStyle>;
    isLoaderColor?: string
}

const CustomBtn = ({
    title,
    onPress,
    isLoading,
    disabled,
    containerStyle,
    textStyle,
    isLoaderColor
}: TCustomBtn) => {
    let loaderColor = isLoaderColor ?? color.white;
    return (
        <TouchableOpacity
            onPress={(isLoading || disabled) ? undefined : onPress}
            activeOpacity={(isLoading || disabled) ? 1 : 0.8}
            style={[
                styles.container,
                {
                    backgroundColor: disabled ? color?.gray : color.saffronMango,
                },
                containerStyle
            ]}
        >
            <View style={styles.textView}>
                <Text
                    style={[
                        styles.text,
                        { color: disabled ? color?.textGray : color.white },
                        textStyle
                    ]}
                >
                    {title}
                </Text>
                {isLoading && <ActivityIndicator
                    style={{ marginStart: 10 }}
                    color={disabled ? color?.textGray : loaderColor}
                />}
            </View>
        </TouchableOpacity>
    )
}

export default CustomBtn

const styles = StyleSheet.create({
    container: {
        // backgroundColor: color.saffronMango,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        paddingHorizontal: 10,
        ...shadow1
    },
    text: {
        paddingVertical: 10,
        fontWeight: '600',
        fontSize: 20,
    },
    textView: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    }
})