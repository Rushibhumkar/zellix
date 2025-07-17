import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { color } from "../const/color";

const Header = ({ title, onBack }) => {
  const { goBack } = useNavigation();
  return (
    <SafeAreaView style={{ backgroundColor: color.darkBlack }}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => onBack ? onBack() : goBack()}>
          <Image
            style={{ marginTop: 8 }}
            source={require("../assets/Backicon.png")} />
        </TouchableOpacity>
        <View>
          <Text
            style={{ color: "#FFFFFF", fontSize: 22, fontWeight: "600" }}
          >
            {title}
          </Text>
        </View>
        <View></View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: color.darkBlack,
    flexDirection: 'row',
    paddingTop: Platform.OS === 'ios' ? 20 : 50,
    paddingBottom: 20,
    paddingHorizontal: 20
  }
});

export default Header;
