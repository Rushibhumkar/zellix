import { useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Image,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { color } from "../const/color";
import CustomText from "../myComponents/CustomText/CustomText";
import { SafeAreaView,useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";

const Header = ({ title, onBack }) => {
  const { goBack } = useNavigation();
  const insets = useSafeAreaInsets(); 

  return (
    <View style={{ backgroundColor: "#2452FA" }}>
      {/* ✅ Gradient fully covers StatusBar area */}
      <LinearGradient
        colors={["#2452FA", "#6CA8FF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBackground}
      >
        <StatusBar translucent backgroundColor="transparent" style="light" />
        <SafeAreaView style={{ backgroundColor: "transparent" }}>
          <View style={[styles.container,{ marginBottom:insets?.bottom !==0 ?-20 :insets.top-8}]}>
            <TouchableOpacity

              style={styles.backButton}
              onPress={() => (onBack ? onBack() : goBack())}
            >
              <Image
                tintColor={color.white}
                source={require("../assets/Backicon.png")}
                style={{width:16,height:16}}
              />
            </TouchableOpacity>

            <CustomText style={styles.titleText}>{title}</CustomText>

            {/* Placeholder for balance */}
            <View style={{ width: 36 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  gradientBackground: {
    width: "100%",
    paddingTop: Platform.OS === "ios" ? 12 : 12, // ensures gradient extends behind translucent StatusBar
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    // justifyContent: "space-between",
    gap:12,
    paddingHorizontal: 20,
  },
  backButton: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 8,
    borderColor: "#ffffff29",
    borderWidth: 2,
  },
  titleText: {
    color: "#FFFFFF",
    fontSize: 20,
  },
});

export default Header;
