import {
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { myConsole } from "../../hooks/useConsole";
import { Modal, ModalContent, SlideAnimation } from "react-native-modals";
import Entypo from "react-native-vector-icons/Entypo";
import AntDesign from "react-native-vector-icons/AntDesign";
import { color } from "../../const/color";
import { sizes } from "../../const";
import CustomText from "../../myComponents/CustomText/CustomText";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Feather from "react-native-vector-icons/Feather";
import { StatusBar } from "expo-status-bar";
import { prepareDataForValidation } from "formik";
import * as Application from "expo-application";
import { useGetUserPermission } from "../../services/rootApi/permissionApi";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import { checkPermission } from "../../utils/commonFunctions";
import SlideFadeIn from "../../utils/animations/SlideFadeIn";

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  navigate: (route: string) => void;
  handleLogout: () => void;
  logoutLoading: boolean;
}

const MenuModal: React.FC<MenuModalProps> = ({
  visible,
  onClose,
  navigate,
  handleLogout,
  logoutLoading,
}) => {
  const latestStoreVersion = "1.6.3";

  const [isUpdateAvailable, setIsUpdateAvailable] = React.useState(false);
  const [showDot, setShowDot] = useState(false);
  const appVersion = Application.nativeApplicationVersion || "1.0.0";
  React.useEffect(() => {
    if (appVersion !== latestStoreVersion) {
      setIsUpdateAvailable(true);
    }
  }, []);

  // myConsole("Application.", Application);

  const { user } = useSelector(selectUser);
  const { data: permission = {} } = useGetUserPermission(user?._id);

  const canViewExpensesSidebar = checkPermission(
    permission,
    "Expenses",
    "sidebar",
    user?.role
  );
  const canViewInvoicesSidebar = checkPermission(
    permission,
    "Invoices",
    "sidebar",
    user?.role
  );
  const canViewBookingsSidebar = checkPermission(
    permission,
    "Bookings",
    "sidebar",
    user?.role
  );

  return (
    <Modal
      visible={visible}
      modalAnimation={new SlideAnimation({ slideFrom: "top" })}
      onTouchOutside={onClose}
      width={1}
      height={Platform.OS === "ios" ? 0.71 : 0.73}
      rounded
      overlayOpacity={0.3}
      modalStyle={{
        marginTop: -20,
        backgroundColor: "#fff",
        position: "relative",
        top: Platform.OS === "ios" ? -140 : -120,
        borderTopRightRadius: 0,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 22,
        borderBottomRightRadius: 22,
        paddingTop: 16,
      }}
    >
      <ModalContent
        style={{
          backgroundColor: "#fff",
          paddingTop: Platform.OS === "ios" ? 70 : 28,
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
        }}
      >
        <StatusBar backgroundColor={color.white} style="dark" />
        {/* Header with Cross */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            // paddingHorizontal: 20,
            marginBottom: 15,
          }}
        >
          <CustomText style={{ fontSize: 22, color: "#2452FA" }}>
            Menu
          </CustomText>

          <TouchableOpacity activeOpacity={0.6} onPress={() => onClose()}>
            <AntDesign name="close" size={24} color="#2452FA" />
          </TouchableOpacity>
        </View>

        {/* Menu Grid */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            justifyContent: "center",
            // paddingHorizontal: 10,
            // backgroundColor: "red",
            width: sizes.width,
            marginLeft: -14,
            gap: 8,
            paddingTop: 12,
          }}
        >
          {[
            {
              label: "HRMS",
              icon: "briefcase",
              route: "HRManagementStack",
              visible: true,
            },
            {
              label: "Bookings",
              icon: "calendar",
              route: "BookingNavigator",
              visible: canViewBookingsSidebar,
            },
            {
              label: "Project",
              icon: "folder",
              route: "ProjectNavigator",
              visible: true,
            },
            {
              label: "Incentive",
              icon: "gift",
              route: "IncentiveNavigator",
              visible: true,
            },
            {
              label: "Leaderboard",
              icon: "bar-chart-2",
              route: "Leaderboard",
              visible: [
                "sup_admin",
                "sub_admin",
                "sr_manager",
                "manager",
                "assistant_manager",
                "team_lead",
                "agent",
              ].includes(user?.role),
            },
            {
              label: "Referrals",
              icon: "user-plus",
              route: "ReferralNavigator",
              visible: true,
            },
            {
              label: "Invoice",
              icon: "file-text",
              route: "InvoiceNavigator",
              visible: canViewInvoicesSidebar,
            },
            {
              label: "Expense",
              icon: "dollar-sign",
              route: "ExpenseNavigator",
              visible: canViewExpensesSidebar,
            },
            {
              label: "User Management",
              icon: "users",
              route: "UsersNavigator",
              visible: true,
            },
            {
              label: "Change Password",
              icon: "lock",
              route: "ChangePassword",
              visible: true,
            },
          ]
            .filter((item) => item.visible)
            .map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.6}
                onPress={() => {
                  onClose();
                  navigate(item.route);
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
                }}
              >
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
                  <SlideFadeIn>
                    <Feather name={item.icon} size={22} color="#fff" />
                  </SlideFadeIn>
                </LinearGradient>
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

        {/* Logout Button */}
        <View
          style={{
            paddingHorizontal: 20,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 10,
          }}
        >
          {/* Logout Button */}
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
              flex: 1,
            }}
          >
            {logoutLoading ? (
              <ActivityIndicator color={color.mainTxtColor} size="small" />
            ) : (
              <>
                <SlideFadeIn>
                  <Feather name="log-out" size={20} color="#fff" />
                </SlideFadeIn>

                <SlideFadeIn>
                  <CustomText
                    style={{
                      color: "#fff",
                      fontSize: 16,
                      fontWeight: "600",
                      marginLeft: 6,
                    }}
                  >
                    Log Out
                  </CustomText>
                </SlideFadeIn>
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text
          style={{
            textAlign: "center",
            marginTop: 12,
            color: "#666",
            fontSize: 13,
            marginBottom: 8,
          }}
          // onPress={() => {
          //   if (isUpdateAvailable) {
          //     if (Platform.OS === "ios") {
          //       Linking.openURL("https://apps.apple.com/app/id6748918861");
          //     } else {
          //       Linking.openURL(
          //         "https://play.google.com/store/apps/details?id=com.skg.zellix"
          //       );
          //     }
          //   } else {
          //     setShowDot(true);
          //   }
          // }}
        >
          App Version: {appVersion}
        </Text>
      </ModalContent>
    </Modal>
  );
};

export default MenuModal;

const styles = StyleSheet.create({});
