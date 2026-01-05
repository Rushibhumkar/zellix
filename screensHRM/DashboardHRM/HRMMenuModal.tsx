import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { Modal, ModalContent, SlideAnimation } from "react-native-modals";
import AntDesign from "react-native-vector-icons/AntDesign";
import { color } from "../../const/color";
import { sizes } from "../../const";
import CustomText from "../../myComponents/CustomText/CustomText";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "react-native-vector-icons/Feather";
import { EvilIcons } from "@expo/vector-icons";
import CRMLogoIcon from "../../assets/svgHRM/CRMLogoIcon";
import ChangePassLogo from "../../assets/svg/ChangePassLogo";
import LogoutLogo from "../../assets/svg/LogoutLogo";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";
import * as Application from "expo-application";

interface HRMMenuModalProps {
  visible: boolean;
  onClose: () => void;
  navigate: (route: string, params?: any) => void;
  handleLogout: () => void;
  logoutLoading: boolean;
  user: any;
}

const HRMMenuModal: React.FC<HRMMenuModalProps> = ({
  visible,
  onClose,
  navigate,
  handleLogout,
  logoutLoading,
  user,
}) => {
  const isAgent = user?.role === "agent";
  const latestStoreVersion = "1.6.3";
  const [isUpdateAvailable, setIsUpdateAvailable] = React.useState(false);
  const appVersion = Application.nativeApplicationVersion || "1.0.0";
  React.useEffect(() => {
    if (appVersion !== latestStoreVersion) {
      setIsUpdateAvailable(true);
    }
  }, []);

  const menuItems = [
    {
      label: "CRMS",
      icon: <CRMLogoIcon />,
      route: "Dashboard",
    },
    isAgent && {
      label: "User Profile",
      icon: <EvilIcons name="user" size={28} color="#2452FA" />,
      route: "UserDetailHRMAgent",
      params: { item: { ...user } },
    },
    {
      label: "Change Password",
      icon: <ChangePassLogo />,
      route: "ChangePassword",
    },
  ].filter(Boolean);

  return (
    <Modal
      visible={visible}
      modalAnimation={new SlideAnimation({ slideFrom: "top" })}
      onTouchOutside={onClose}
      width={1}
      height={0.5}
      rounded
      overlayOpacity={0.3}
      modalStyle={{
        marginTop: 0,
        paddingTop: 80,
        backgroundColor: "#fff",
        position: "relative",
        top: -260,
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
      }}
    >
      <ModalContent
        style={{
          backgroundColor: "#fff",
          paddingTop: 20,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 15,
          }}
        >
          <CustomText style={{ fontSize: 22, color: "#2452FA" }}>
            Settings
          </CustomText>

          <TouchableOpacity activeOpacity={0.6} onPress={onClose}>
            <AntDesign name="close" size={24} color="#2452FA" />
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            width: sizes.width,
            marginLeft: -14,
            gap: 8,
            paddingTop: Platform.OS === "ios" ? 24 : 12,
          }}
        >
          {menuItems.map((item: any, index: number) => (
            <TouchableOpacity
              key={index}
              activeOpacity={0.6}
              onPress={() => {
                onClose();
                navigate(item.route, item.params);
              }}
              style={{
                width: "30%",
                aspectRatio: 1,
                backgroundColor: "#F9FBFD",
                borderRadius: 14,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: "#739fe12a",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 3,
                elevation: 2,
                paddingVertical: 8,
                marginTop: Platform.OS === "ios" ? -12 : 8,
              }}
            >
              <SlideFadeIn>
                <LinearGradient
                  colors={["#2E67BE", "#4985F2"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    borderRadius: 12,
                    padding: 10,
                    marginBottom: 6,
                    shadowColor: "#2452FA",
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </LinearGradient>
              </SlideFadeIn>
              <SlideFadeIn>
                <CustomText
                  style={{
                    fontSize: 13,
                    color: color.mainTxtColor,
                    textAlign: "center",
                    paddingHorizontal: 4,
                  }}
                >
                  {item.label}
                </CustomText>
              </SlideFadeIn>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <View style={{ paddingHorizontal: 20, marginTop: 25 }}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => {
              onClose();
              handleLogout?.();
            }}
            style={{
              backgroundColor: "#FF3B30",
              borderRadius: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 14,
              gap: 8,
              shadowColor: "#FF3B30",
              shadowOpacity: 0.25,
              shadowRadius: 5,
              elevation: 3,
            }}
          >
            {logoutLoading ? (
              <ActivityIndicator color={color.mainTxtColor} size="small" />
            ) : (
              <>
                <Feather name="log-out" size={20} color="#fff" />
                <CustomText
                  style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}
                >
                  Log Out
                </CustomText>
              </>
            )}
          </TouchableOpacity>
          <Text
            style={{
              textAlign: "center",
              marginTop: 12,
              color: "#666",
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            App Version: {appVersion}
          </Text>
        </View>
      </ModalContent>
    </Modal>
  );
};

export default HRMMenuModal;

const styles = StyleSheet.create({});
