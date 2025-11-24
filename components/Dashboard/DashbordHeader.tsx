// src/components/Dashboard/DashbordHeader.tsx
import { CommonActions, useNavigation } from "@react-navigation/native";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import Feather from "react-native-vector-icons/Feather";
import CustomText from "../../myComponents/CustomText/CustomText";
import { selectUser } from "../../redux/userSlice";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import MenuModal from "./MenuModal";
import { logOut } from "../../services/authApi/auth";
import { removeItemValue } from "../../hooks/useAsyncStorage";
import { onLogOutEmpty } from "../../redux/action";

const DashbordHeader = () => {
  const { user } = useSelector(selectUser);
  const { navigate } = useNavigation();
  const insets = useSafeAreaInsets();
  const [menuVisible, setMenuVisible] = React.useState(false);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      let a = await logOut(user?._id);
      await removeItemValue("token");
      await removeItemValue("userDetail");
      await dispatch(onLogOutEmpty());
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
      setMenuVisible(false);
    } catch (error) {
      console.error("Error logging out:", error);
      setMenuVisible(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#2452faff", "#6CA8FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBackground}
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          style={menuVisible ? "dark" : "light"}
          backgroundColor={menuVisible ? "#fff" : undefined}
        />

        {/* Content Box (no gradient inside) */}
        <View
          style={[
            styles.contentBox,
            {
              marginBottom:
                insets?.bottom !== 0
                  ? Platform.OS === "ios"
                    ? -24
                    : -28
                  : insets.top - 20,
            },
          ]}
        >
          {/* Left Side — User Info */}
          <View style={styles.leftContainer}>
            <CustomText style={styles.userName}>{user?.name || ""}</CustomText>
            {user?.role === "sup_admin" && (
              <CustomText style={styles.userRole}>Super Admin</CustomText>
            )}

            {user?.role === "sub_admin" && (
              <CustomText style={styles.userRole}>Sub Admin</CustomText>
            )}

            {user?.role === "admin" && (
              <CustomText style={styles.userRole}>Admin</CustomText>
            )}

            <CustomText style={styles.userEmail}>
              {user?.email || ""}
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
              onPress={() => setMenuVisible(true)}
              style={styles.iconBtn}
            >
              <Feather name="menu" size={22} color="#fff" />
            </Pressable>
          </View>
        </View>
        <MenuModal
          visible={menuVisible}
          onClose={() => setMenuVisible(false)}
          navigate={navigate}
          handleLogout={handleLogout}
          logoutLoading={isLoading}
        />
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
    paddingTop: Platform.OS === "ios" ? 8 : 12,
    // paddingBottom: 8,
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
    borderColor: "#ffffff29",
    borderWidth: 2,
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
