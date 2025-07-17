import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from "react-native";
import React, { ReactNode } from "react";
import { color } from "../../const/color";
import CustomText from "../../myComponents/CustomText/CustomText";
import { StatusBar } from "expo-status-bar";
import { useNavigation } from "@react-navigation/native";
import Setting from "../../assets/svg/Setting";
import Notification from "../../assets/svg/Notification";
import { SafeAreaView } from "react-native-safe-area-context";
import BackIcon from "../../assets/svgHRM/BackIcon";
import EditIcon from "../../assets/svgHRM/EditIcon";
import DeleteIcon from "../../assets/svgHRM/DeleteIcon";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/userSlice";
import LoadingModal from "../LoadingCompo/LoadingModal";
import { routeExtra } from "../../utils/routesHRM";
import ChangeStatus from "../../assets/svg/ChangeStatus";

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
  //HeaderHRM
  const HeaderHRM = () => {
    return (
      <View
        style={{
          backgroundColor: color.paleGrey,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}
      >
        {!!headingTitle ? (
          <CustomText fontWeight="700" fontSize={20} color={color.saffronMango}>
            {headingTitle}
          </CustomText>
        ) : (
          <View>
            <CustomText
              fontSize={20}
              fontWeight="400"
              color={color.hrmHeaderText}
            >
              {user?.name}
            </CustomText>
            <CustomText
              fontSize={14}
              fontWeight="400"
              color={color.hrmHeaderText}
            >
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
            <Pressable onPress={onStatusPress}>
              <ChangeStatus />
            </Pressable>
          )}
          <Pressable onPress={() => navigate(routeExtra?.NotificationHRM)}>
            <Notification />
          </Pressable>
          <Pressable onPress={() => navigate(routeExtra?.SettingHRM)}>
            <Setting />
          </Pressable>
        </View>
      </View>
    );
  };

  const GoBackHeaderHRM = () => {
    return (
      <View
        style={{
          backgroundColor: color.paleGrey,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 10,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 10,
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
              <ChangeStatus />
            </Pressable>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: color.paleGrey }}>
      <StatusBar style="dark" />
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
      <LoadingModal isVisible={isLoading} />
    </SafeAreaView>
  );
};

export default ContainerHRM;

const styles = StyleSheet.create({});
