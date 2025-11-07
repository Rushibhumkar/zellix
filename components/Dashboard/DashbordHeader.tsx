// src/components/Dashboard/DashbordHeader.tsx
import { useNavigation } from "@react-navigation/native";
import React from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import Feather from "react-native-vector-icons/Feather";
import CustomText from "../../myComponents/CustomText/CustomText";
import { selectUser } from "../../redux/userSlice";
import { SafeAreaView } from "react-native-safe-area-context";

const DashbordHeader = () => {
  const { user } = useSelector(selectUser);
  const { navigate } = useNavigation();

  return (
    <LinearGradient
      colors={["#2452faff", "#6CA8FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />

        {/* Content Box (no gradient inside) */}
        <View style={styles.contentBox}>
          {/* Left Side — User Info */}
          <View style={styles.leftContainer}>
            <CustomText style={styles.userName}>
              {user?.name || "John Bosco"}
            </CustomText>
            <CustomText style={styles.userRole}>
              {user?.role === "sup_admin"
                ? "Super Admin"
                : user?.role === "sub_admin"
                ? "Sub Admin"
                : user?.role === "admin"
                ? "Admin"
                : "User"}
            </CustomText>
            <CustomText style={styles.userEmail}>
              {user?.email || "john.bosco@zellix.com"}
            </CustomText>
          </View>

          {/* Right Side — Icons */}
          <View style={styles.iconWrapper}>
            <Pressable
              onPress={() => navigate("Notification")}
              style={styles.iconBtn}
            >
              <View style={styles.iconBadge} />
              <Feather name="bell" size={22} color="#fff" />
            </Pressable>
            <Pressable
              onPress={() => navigate("Setting")}
              style={styles.iconBtn}
            >
              <Feather name="settings" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

// ✅ Styles
const styles = StyleSheet.create({
  gradientBackground: {
    width: "100%",
    overflow: "hidden",
  },
  safeArea: {
    width: "100%",
  },
  contentBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 16 : 15,
    paddingBottom: 8,
  },
  leftContainer: {
    flex: 1,
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
  },
  userRole: {
    color: "rgba(235, 243, 255, 0.9)",
    fontSize: 14,
    marginTop: 2,
  },
  userEmail: {
    color: "#E0E8FF",
    fontSize: 13,
    marginTop: 4,
  },
  iconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconBtn: {
    position: "relative",
    padding: 8,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  iconBadge: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FF3B30",
  },
});

export default DashbordHeader;
