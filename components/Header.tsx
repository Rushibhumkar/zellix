import { CommonActions, useNavigation } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { color } from "../const/color";
import CustomText from "../myComponents/CustomText/CustomText";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";
import MenuModal from "./Dashboard/MenuModal";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../redux/userSlice";
import { logOut } from "../services/authApi/auth";
import { removeItemValue } from "../hooks/useAsyncStorage";
import { onLogOutEmpty } from "../redux/action";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";

interface HeaderProps {
  title: string;
  onBack?: () => void;
  showBackIcon?: boolean;
  showActions?: boolean;
  onPressSearch?: () => void;
  onPressFilter?: () => void;
  onPressAdd?: () => void;
  isWithAnimation?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onBack,
  showBackIcon = true,
  showActions = false,
  onPressSearch,
  onPressFilter,
  onPressAdd,
  isWithAnimation = false,
}) => {
  const { goBack, navigate } = useNavigation();
  const insets = useSafeAreaInsets();

  const { user } = useSelector(selectUser);
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: insets?.bottom !== 0 ? -20 : insets.top - 8,
              paddingHorizontal: 20,
            }}
          >
            <View style={[styles.container]}>
              {showBackIcon && (
                <TouchableOpacity
                  style={styles.backButton}
                  onPress={() => (onBack ? onBack() : goBack())}
                >
                  <Image
                    tintColor={color.white}
                    source={require("../assets/Backicon.png")}
                    style={{ width: 16, height: 16 }}
                  />
                </TouchableOpacity>
              )}

              <CustomText style={styles.titleText}>{title}</CustomText>

              {/* Placeholder for balance */}
            </View>
            {isWithAnimation ? (
              <Animated.View
                entering={FadeInDown.duration(400)}
                exiting={FadeOutUp.duration(300)}
                style={styles.iconWrapper}
              >
                {showActions && (
                  <>
                    <Pressable onPress={onPressSearch} style={styles.iconBtn}>
                      <Feather name="search" size={20} color="#fff" />
                    </Pressable>
                    <Pressable onPress={onPressFilter} style={styles.iconBtn}>
                      <Feather name="filter" size={20} color="#fff" />
                    </Pressable>
                    <Pressable onPress={onPressAdd} style={styles.iconBtn}>
                      <Feather name="plus" size={20} color="#fff" />
                    </Pressable>
                  </>
                )}
                {title !== "Notification" && (
                  <Pressable
                    onPress={() => navigate("Notification")}
                    style={styles.iconBtn}
                  >
                    <View style={styles.iconBadge} />
                    <Feather name="bell" size={20} color="#fff" />
                  </Pressable>
                )}
                <Pressable
                  onPress={() => setMenuVisible(true)}
                  style={styles.iconBtn}
                >
                  <Feather name="menu" size={20} color="#fff" />
                </Pressable>
              </Animated.View>
            ) : (
              <View style={styles.iconWrapper}>
                {showActions && (
                  <>
                    <Pressable onPress={onPressSearch} style={styles.iconBtn}>
                      <Feather name="search" size={20} color="#fff" />
                    </Pressable>
                    <Pressable onPress={onPressFilter} style={styles.iconBtn}>
                      <Feather name="filter" size={20} color="#fff" />
                    </Pressable>
                    <Pressable onPress={onPressAdd} style={styles.iconBtn}>
                      <Feather name="plus" size={20} color="#fff" />
                    </Pressable>
                  </>
                )}
                {title !== "Notification" && (
                  <Pressable
                    onPress={() => navigate("Notification")}
                    style={styles.iconBtn}
                  >
                    <View style={styles.iconBadge} />
                    <Feather name="bell" size={20} color="#fff" />
                  </Pressable>
                )}
                <Pressable
                  onPress={() => setMenuVisible(true)}
                  style={styles.iconBtn}
                >
                  <Feather name="menu" size={20} color="#fff" />
                </Pressable>
              </View>
            )}
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
    gap: 12,
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
  iconWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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

export default Header;
