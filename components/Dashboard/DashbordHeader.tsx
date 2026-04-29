// src/components/Dashboard/DashbordHeader.tsx
import { useGetNotificationInCRM } from "../../hooks/useGetQuerryHRM";
import { CommonActions, useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
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
import SkeletonView from "../../myComponents/SkeletonView/SkeletonView";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";
import { myConsole } from "../../hooks/useConsole";
import { useQueryClient } from "@tanstack/react-query";
import {
  getInitials,
  getInitialsUsingTwoNames,
} from "../../utils/commonFunctions";

const DashbordHeader = () => {
  const { user } = useSelector(selectUser);

  const { navigate } = useNavigation();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [menuVisible, setMenuVisible] = React.useState(false);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      let a = await logOut(user?._id);
      await queryClient.clear();
      await removeItemValue("token");
      await removeItemValue("userDetail");
      await dispatch(onLogOutEmpty());
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        }),
      );
      setMenuVisible(false);
    } catch (error) {
      console.error("Error logging out:", error);
      setMenuVisible(false);
    } finally {
      setIsLoading(false);
    }
  };

  const { data: notifiData } = useGetNotificationInCRM({ id: user?._id });

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
                    ? -28
                    : -28
                  : insets.top - 20,
            },
          ]}
        >
          {/* Left Side — User Info */}
          <SlideFadeIn style={styles.leftContainer}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                overflow: "hidden",
              }}
            >
              {isLoading ? (
                <SkeletonView
                  wrapperStyle={{ width: 90, height: 18, borderRadius: 6 }}
                />
              ) : (
                <CustomText style={styles.userName}>
                  {(() => {
                    const fullName =
                      `${user?.name || ""} ${user?.lastName || ""}`.trim();
                    return fullName.length <= 8 ? fullName : user?.name || "";
                  })()}
                </CustomText>
              )}

              {isLoading ? (
                <SkeletonView
                  wrapperStyle={{
                    width: 70,
                    height: 16,
                    borderRadius: 5,
                  }}
                />
              ) : user?.role === "sup_admin" ? (
                <CustomText style={styles.userRole}>Super Admin</CustomText>
              ) : user?.role === "sub_admin" ? (
                <CustomText style={styles.userRole}>Sub Admin</CustomText>
              ) : user?.role === "admin" ? (
                <CustomText style={styles.userRole}>Admin</CustomText>
              ) : null}
            </View>
            {/* USER EMAIL */}
            {isLoading ? (
              <SkeletonView
                wrapperStyle={{
                  width: 140,
                  height: 14,
                  borderRadius: 5,
                  marginTop: 6,
                }}
              />
            ) : (
              <CustomText style={styles.userEmail}>
                {user?.email || ""}
              </CustomText>
            )}
          </SlideFadeIn>

          {/* Right Side — Icons */}
          <SlideFadeIn from={-10}>
            <View style={styles.iconWrapper}>
              {/* <Pressable onPress={() => null} style={styles.iconBtn}>
                <Feather name="search" size={18} color="#fff" />
              </Pressable> */}
              {user?.name && (
                <TouchableOpacity
                  onPress={() => navigate("ProfileScreen")}
                  style={styles.avatarBtn}
                >
                  <CustomText style={styles.avatarText}>
                    {getInitialsUsingTwoNames(user?.name, user?.lastName)}
                  </CustomText>
                </TouchableOpacity>
              )}

              <Pressable
                onPress={() => navigate("Reminders")}
                style={styles.iconBtn}
              >
                <Feather name="clock" size={18} color="#fff" />
              </Pressable>

              <Pressable
                onPress={() => navigate("Notification")}
                style={styles.iconBtn}
              >
                {notifiData?.some((item) => !item?.seen) && (
                  <View style={styles.iconBadge} />
                )}
                <Feather name="bell" size={18} color="#fff" />
              </Pressable>

              <Pressable
                onPress={() => setMenuVisible(true)}
                style={styles.iconBtn}
              >
                <Feather name="menu" size={18} color="#fff" />
              </Pressable>
            </View>
          </SlideFadeIn>
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
    paddingHorizontal: 14,
    paddingTop: Platform.OS === "ios" ? 2 : 8,
  },
  leftContainer: {
    flex: 1,
  },
  userName: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  userRole: {
    color: "rgba(235, 243, 255, 0.9)",
    fontSize: 12,
    marginTop: 2,
    backgroundColor: "#ffffff3c",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  userEmail: {
    color: "#E0E8FF",
    fontSize: 12,
    marginTop: 4,
  },
  iconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBtn: {
    position: "relative",
    padding: 8,
    borderRadius: 12,
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

  avatarBtn: {
    height: 36,
    width: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#ffffff40",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    marginRight: -2,
  },

  avatarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default DashbordHeader;
