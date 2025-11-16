import {
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import React, { ReactNode, useState } from "react";
import { color } from "../../const/color";
import CustomText from "../../myComponents/CustomText/CustomText";
import { StatusBar } from "expo-status-bar";
import { CommonActions, useNavigation } from "@react-navigation/native";
import Setting from "../../assets/svg/Setting";
import Notification from "../../assets/svg/Notification";
import { SafeAreaView } from "react-native-safe-area-context";
import BackIcon from "../../assets/svgHRM/BackIcon";
import EditIcon from "../../assets/svgHRM/EditIcon";
import DeleteIcon from "../../assets/svgHRM/DeleteIcon";
import { useDispatch, useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import LoadingModal from "../LoadingCompo/LoadingModal";
import { routeExtra } from "../../utils/routesHRM";
import ChangeStatus from "../../assets/svg/ChangeStatus";
import { LinearGradient } from "expo-linear-gradient";
import HRMMenuModal from "../../screensHRM/DashboardHRM/HRMMenuModal";
import { removeItemValue } from "../../hooks/useAsyncStorage";
import { onLogOutEmpty } from "../../redux/action";
import { logOut } from "../../services/authApi/auth";
import { Feather } from "@expo/vector-icons";

interface TContainerHRM {
  children: ReactNode;
  childStyle?: StyleProp<ViewStyle>;
  isBAck?: {
    isGoBack?: () => void;
    title: string;
    isDelete?: () => void;
    isEdit?: () => void;
    isStatus?: () => void;
  };
  ph?: number;
  pv?: number;
  pt?: number;
  isLoading?: boolean;
  headingTitle?: string;
  hasStatusIcon?: boolean;
  onStatusPress?: () => void;
}
const ContainerHRM = ({
  children,
  childStyle,
  isBAck,
  ph,
  pv,
  pt,
  isLoading = false,
  headingTitle,
  hasStatusIcon,
  onStatusPress,
}: TContainerHRM) => {
  const { navigate, goBack } = useNavigation();
  const { user } = useSelector(selectUser);
  const dispatch = useDispatch();
  const [logoutLoad, setLogoutLoad] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await logOut(user?._id);
      await removeItemValue("token");
      await removeItemValue("userDetail");
      await dispatch(onLogOutEmpty());

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
      setLogoutLoad(true);
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      setLogoutLoad(false);
    }
  };

  //HeaderHRM
  const HeaderHRM = () => {
    return (
      <LinearGradient
        colors={["#2E67BE", "#4985F2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          paddingTop: Platform.OS === "ios" ? 60 : 48, // ✅ include StatusBar height
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingBottom: Platform.OS === "ios" ? 16 : 10,
        }}
      >
        {!!headingTitle ? (
          <CustomText fontWeight="700" fontSize={20} color={color.white}>
            {headingTitle}
          </CustomText>
        ) : (
          <View>
            <CustomText fontSize={20} fontWeight="400" color={color.white}>
              {user?.name}
            </CustomText>
            <CustomText fontSize={14} fontWeight="400" color={color.white}>
              {user?.email}
            </CustomText>
          </View>
        )}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 10,
          }}
        >
          {hasStatusIcon && (
            <Pressable onPress={onStatusPress} style={styles.iconBtn}>
              <ChangeStatus />
            </Pressable>
          )}
          <Pressable
            onPress={() => navigate(routeExtra?.NotificationHRM)}
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
      </LinearGradient>
    );
  };

  const GoBackHeaderHRM = () => {
    return (
      <LinearGradient
        colors={["#2E67BE", "#4985F2"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          paddingTop: 45,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingBottom: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 12,
            paddingTop: Platform.OS === "ios" ? 24 : 12,
            paddingBlock: 12,
          }}
        >
          <Pressable onPress={goBack}>
            <BackIcon />
          </Pressable>

          <CustomText
            fontSize={18}
            fontWeight="700"
            style={{
              fontStyle: "italic",
              textTransform: "capitalize",
              color: color.white,
            }}
          >
            {isBAck?.title ?? "N/A"}
          </CustomText>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 10,
            marginBottom: Platform.OS === "ios" ? -12 : -4,
          }}
        >
          {!!isBAck?.isEdit && (
            <Pressable onPress={() => isBAck?.isEdit()}>
              <EditIcon />
            </Pressable>
          )}
          {!!isBAck?.isDelete && (
            <Pressable onPress={() => isBAck?.isDelete()}>
              <DeleteIcon />
            </Pressable>
          )}
          {!!isBAck?.isStatus && (
            <Pressable onPress={() => isBAck?.isStatus()}>
              <View
                style={{
                  backgroundColor: color.mainTxtColor,
                  borderRadius: 50,
                  padding: 8,
                }}
              >
                <ChangeStatus />
              </View>
            </Pressable>
          )}
        </View>
      </LinearGradient>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "transparent" }}>
      <StatusBar
        translucent
        backgroundColor="transparent"
        barStyle="light-content"
      />
      {!!isBAck?.title ? <GoBackHeaderHRM /> : <HeaderHRM />}
      <View
        style={[
          {
            backgroundColor: color.white,
            height: "98%",
            paddingHorizontal: ph,
            paddingVertical: pv,
            paddingTop: pt,
          },
          childStyle,
        ]}
      >
        {children}
      </View>
      <LoadingModal isVisible={logoutLoad} />
      <HRMMenuModal
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        navigate={navigate}
        handleLogout={handleLogout}
        logoutLoading={logoutLoad}
        user={user}
      />
    </View>
  );
};

export default ContainerHRM;

const styles = StyleSheet.create({
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
