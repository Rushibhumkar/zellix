// import { Text, StyleSheet, View } from "react-native";
// import React from "react";
// import Container from "../../../myComponents/Container/Container";

// const LeadListHeading = () => {
//   return (
//     <Container style={{ paddingHorizontal: 20 }}>
//       <View style={styles.headingContainer}>
//         <Text style={styles.headingText}>No</Text>
//         <Text style={styles.headingText}>Name</Text>
//         <Text style={styles.headingText}>Type</Text>
//         <Text style={styles.headingText}>Status</Text>
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
  containerStyle
}) => {
  return (
    <Container style={[{ paddingHorizontal: 20 }, containerStyle]}>
      <View style={styles.headingContainer}>
        <View style={{ width: "10%" }}>
          <Text
            style={[styles.headingText]}>{noText}
          </Text>
        </View>
        <View style={{ width: "36%" }}>
          <Text
            style={[styles.headingText]}>{nameText}
          </Text>
        </View>
        <View style={{ width: "27%", alignItems: 'center' }}>
          <Text
            style={[styles.headingText]}>{typeText}
          </Text>
        </View>
        <View style={{ width: "27%", alignItems: 'center' }}>
          <Text
            style={[styles.headingText]}>{statusText}
          </Text>
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  headingContainer: {
    backgroundColor: "#3E3E3E",
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

