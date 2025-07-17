// import { StyleProp, StyleSheet, Text, TextProps, TextStyle, View } from 'react-native'
// import React, { ReactNode } from 'react'

// interface TCustomText {
//     fontSize: number;
//     fontWeight: string;
//     color: string;
//     children: ReactNode;
//     marginBottom: number;
//     textStyle: StyleProp<TextProps>;
// }

// interface CustomTextProps {
//     fontSize: number;
//     fontWeight: string;
//     color: string;
//     children: ReactNode;
//     marginBottom: number;
//     style?: StyleProp<TextStyle>;
// }

// const CustomText: React.FC<CustomTextProps> = ({
//     fontSize,
//     children,
//     fontWeight,
//     color,
//     marginBottom,
//     style
// }) => {
//     const textStyle: StyleProp<TextStyle> = {
//         fontSize,
//         children,
//         fontWeight,
//         color,
//         marginBottom,
//         ...style
//     };
//     return (
//         <Text
//             style={textStyle}
//         >{children}
//         </Text>
//     )
// }

// export default CustomText

// CustomText.tsx
import React, { ReactNode } from 'react';
import { Text, StyleProp, TextStyle } from 'react-native';

interface CustomTextProps {
    fontSize?: number;
    marginBottom?: number;
    color?: string;
    fontWeight?: string;
    children: ReactNode;
    numberOfLines?: number;
    style?: StyleProp<TextStyle>;
}

const CustomText: React.FC<CustomTextProps> = ({
    fontSize,
    children,
    fontWeight,
    color,
    marginBottom,
    numberOfLines,
    style
}) => {
    const textStyle: StyleProp<TextStyle> = {
        fontSize: fontSize,
        color: color,
        fontWeight: fontWeight,
        marginBottom: marginBottom,
        ...style,
    };

    return <Text
        style={textStyle}
        numberOfLines={numberOfLines}
    >{children}</Text>;
};

export default CustomText;


