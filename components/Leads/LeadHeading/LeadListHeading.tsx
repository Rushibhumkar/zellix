// import { Text, StyleSheet, View } from "react-native";
// import React from "react";
// import Container from "../../../myComponents/Container/Container";

// const LeadListHeading = () => {
//   return (
//     <Container style={{ paddingHorizontal: 20 }}>
//       <View style={styles.headingContainer}>
//         <CustomText style={styles.headingText}>No</CustomText>
//         <CustomText style={styles.headingText}>Name</CustomText>
//         <CustomText style={styles.headingText}>Type</CustomText>
//         <CustomText style={styles.headingText}>Status</CustomText>
//       </View>
//     </Container>
//   );
// };
// export default LeadListHeading;
// const styles = StyleSheet.create({
//   headingContainer: {
//     backgroundColor: "#3E3E3E",
//     flexDirection: "row",
//     padding: 10,
//     borderRadius: 11,
//     marginBottom: -8,
//     marginTop: 25,
//     justifyContent: "space-between",
//   },
//   headingText: {
//     fontSize: 16,
//     fontWeight: "700",
//     color: "#FFFFFF",
//     lineHeight: 18,
//     letterSpacing: 0.7,
//   },
// });

import { Text, StyleSheet, View, StyleProp, ViewStyle } from "react-native";
import React from "react";
import Container from "../../../myComponents/Container/Container";
import { color } from "../../../const/color";
import CustomText from "../../../myComponents/CustomText/CustomText";

interface LeadListHeadingProps {
  noText: string;
  nameText: string;
  typeText: string;
  statusText: string;
  containerStyle?: StyleProp<ViewStyle>;
}

const LeadListHeading: React.FC<LeadListHeadingProps> = ({
  noText,
  nameText,
  typeText,
  statusText,
  containerStyle,
}) => {
  return (
    <Container style={[{ paddingHorizontal: 20 }, containerStyle]}>
      <View style={styles.headingContainer}>
        <View style={{ width: "10%" }}>
          <CustomText style={[styles.headingText]}>{noText}</CustomText>
        </View>
        <View style={{ width: "36%" }}>
          <CustomText style={[styles.headingText]}>{nameText}</CustomText>
        </View>
        <View style={{ width: "27%", alignItems: "center" }}>
          <CustomText style={[styles.headingText]}>{typeText}</CustomText>
        </View>
        <View style={{ width: "27%", alignItems: "center" }}>
          <CustomText style={[styles.headingText]}>{statusText}</CustomText>
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  headingContainer: {
    backgroundColor: color.primary200,
    flexDirection: "row",
    padding: 10,
    borderRadius: 11,
    marginBottom: -8,
    marginTop: 25,
    // justifyContent: "space-between",
  },
  headingText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
    lineHeight: 18,
  },
});

export default LeadListHeading;
