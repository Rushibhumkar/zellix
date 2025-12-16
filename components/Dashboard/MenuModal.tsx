import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
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
  return (
    <Modal
      visible={visible}
      modalAnimation={new SlideAnimation({ slideFrom: "top" })}
      onTouchOutside={onClose}
      width={1}
      height={0.7}
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
            },
            {
              label: "Bookings",
              icon: "calendar",
              route: "BookingNavigator",
            },
            { label: "Project", icon: "folder", route: "ProjectNavigator" },
            {
              label: "Incentive",
              icon: "gift",
              route: "IncentiveNavigator",
            },
            {
              label: "Referrals",
              icon: "user-plus",
              route: "ReferralNavigator",
            },
            {
              label: "Invoice",
              icon: "file-text",
              route: "InvoiceNavigator",
            },
            {
              label: "Expense",
              icon: "dollar-sign",
              route: "ExpenseNavigator",
            },
            {
              label: "User Management",
              icon: "users",
              route: "UsersNavigator",
            },
            {
              label: "Change Password",
              icon: "lock",
              route: "ChangePassword",
            },
          ].map((item, index) => (
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
                <Feather name={item.icon} size={22} color="#fff" />
              </LinearGradient>
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
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View style={{ paddingHorizontal: 20 }}>
          <TouchableOpacity
            activeOpacity={0.6}
            onPress={() => {
              onClose();
              handleLogout?.(); // ✅ replace with your logout handler
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
        </View>
      </ModalContent>
    </Modal>
  );
};

export default MenuModal;

const styles = StyleSheet.create({});
