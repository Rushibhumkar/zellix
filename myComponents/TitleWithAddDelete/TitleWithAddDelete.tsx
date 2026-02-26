import {
  AntDesign,
  Feather,
  FontAwesome,
  FontAwesome5,
  MaterialIcons,
} from "@expo/vector-icons";
import React from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import EditIcon from "../../assets/svg/EditIcon";
import { color } from "../../const/color";
import CustomText from "../CustomText/CustomText";
import { LinearGradient } from "expo-linear-gradient";
import { iconWrapperStyle, shadowPrimaryColor } from "../../const/globalStyle";
import Animated, {
  FadeInDown,
  FadeOutUp,
  FadeIn,
  FadeOut,
  SlideInRight,
  SlideOutRight,
  BounceIn,
  BounceOut,
} from "react-native-reanimated";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedView = Animated.createAnimatedComponent(View);

interface TTitleWithAddDelete {
  arrLength: number;
  showAddBtn?: any;
  onPressToNavigate: () => void;
  onPressToDelete: () => void;
  title: string;
  onPressToEdit: () => void;
  onPressToAssignLead: () => void;
  onPressToFilter: () => void;
  onCloseSearch: () => void;
  onSelectLeadType: () => void;
  isWithAnimation?: boolean;
  buttons?: {
    title: string;
    onPress: () => void;
    style?: any;
    icon?: React.ReactNode;
  }[];
}

const TitleWithAddDelete = ({
  arrLength,
  title,
  showAddBtn = true,
  onPressToNavigate,
  onPressToDelete,
  onPressToEdit,
  onPressToAssignLead,
  onPressToFilter,
  onCloseSearch,
  onSelectLeadType,
  isWithAnimation = false,
  buttons,
}: TTitleWithAddDelete) => {
  return (
    <LinearGradient
      colors={["#2b58f7ff", "#6CA8FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.gradientBackground,
        { paddingBottom: arrLength > 0 ? 6 : 10 },
      ]}
    >
      {arrLength === 0 && (
        <Pressable
          style={{
            flexDirection: "row",
            gap: 10,
            marginHorizontal: 20,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {!!onSelectLeadType && (
              <AnimatedTouchableOpacity
                entering={
                  isWithAnimation
                    ? FadeInDown.duration(300).delay(100)
                    : undefined
                }
                exiting={isWithAnimation ? FadeOutUp.duration(200) : undefined}
                onPress={onSelectLeadType}
                style={{
                  backgroundColor: color.mainTxtColorFade,
                  borderWidth: 1,
                  borderColor: color.strokeColor,
                  borderRadius: 14,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  marginRight: 8,
                }}
              >
                <FontAwesome name="exchange" size={24} color={color.white} />
              </AnimatedTouchableOpacity>
            )}

            {!!onPressToFilter && (
              <AnimatedTouchableOpacity
                entering={
                  isWithAnimation
                    ? FadeInDown.duration(300).delay(150)
                    : undefined
                }
                exiting={isWithAnimation ? FadeOutUp.duration(200) : undefined}
                onPress={!!onPressToFilter ? onPressToFilter : undefined}
                style={{
                  backgroundColor: "#ffffff3d",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: 12,
                  flexDirection: "row",
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: "#ffffff88",
                  paddingHorizontal: 16,
                  paddingVertical: Platform.OS === "ios" ? 7 : 5,
                  width: !!onSelectLeadType
                    ? Platform.OS === "ios"
                      ? title === "Bookings"
                        ? 160
                        : 170
                      : title === "Bookings"
                        ? 130
                        : 140
                    : 180,
                }}
              >
                <Feather name="filter" color={"#fff"} size={18} />
                <CustomText style={{ color: "#fff" }}>Filter</CustomText>
                {!!onCloseSearch && (
                  <AnimatedTouchableOpacity
                    style={{ marginVertical: -8 }}
                    entering={
                      isWithAnimation ? FadeIn.duration(300) : undefined
                    }
                    exiting={
                      isWithAnimation ? FadeOut.duration(200) : undefined
                    }
                    onPress={!!onCloseSearch ? onCloseSearch : undefined}
                  >
                    <AntDesign
                      name="close"
                      size={22}
                      color={color.white}
                      style={{
                        marginLeft: 10,
                      }}
                    />
                  </AnimatedTouchableOpacity>
                )}
              </AnimatedTouchableOpacity>
            )}
          </View>

          {showAddBtn && (
            <AnimatedTouchableOpacity
              entering={
                isWithAnimation
                  ? SlideInRight.duration(400).springify()
                  : undefined
              }
              exiting={
                isWithAnimation ? SlideOutRight.duration(300) : undefined
              }
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                backgroundColor: "#fff",
                paddingHorizontal: 12,
                paddingVertical: Platform.OS === "ios" ? 8 : 6,
                borderRadius: 12,
                ...shadowPrimaryColor,
              }}
              onPress={!!onPressToNavigate ? onPressToNavigate : undefined}
            >
              <AntDesign name="plus" size={16} color={color.primaryColor} />
              <View>
                <CustomText
                  style={{
                    color: color.primaryColor,
                  }}
                >
                  Add {title ?? "title"}
                </CustomText>
              </View>
            </AnimatedTouchableOpacity>
          )}
          {!!buttons?.length && (
            <AnimatedView
              style={{
                flexDirection: "row",
                gap: 10,
                paddingTop: 4,
                // marginBottom: -6,
              }}
              entering={
                isWithAnimation
                  ? FadeInDown.duration(300).delay(200)
                  : undefined
              }
              exiting={isWithAnimation ? FadeOutUp.duration(200) : undefined}
            >
              {buttons.map((b, i) => (
                <AnimatedTouchableOpacity
                  key={i}
                  style={[
                    {
                      backgroundColor: "#ffffff3d",
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                      borderRadius: 10,
                      flexDirection: "row",
                      alignItems: "center",
                    },
                    b.style,
                  ]}
                  onPress={b.onPress}
                  entering={
                    isWithAnimation
                      ? FadeInDown.duration(300).delay(250 + i * 50)
                      : undefined
                  }
                  exiting={
                    isWithAnimation ? FadeOutUp.duration(200) : undefined
                  }
                >
                  {b.icon}
                  <CustomText
                    style={{ color: "#fff", marginLeft: b.icon ? 6 : 0 }}
                  >
                    {b.title}
                  </CustomText>
                </AnimatedTouchableOpacity>
              ))}
            </AnimatedView>
          )}
        </Pressable>
      )}

      {arrLength > 0 && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 25,
            paddingTop: 8,
          }}
        >
          <AnimatedView
            entering={isWithAnimation ? FadeInDown.duration(300) : undefined}
            exiting={isWithAnimation ? FadeOutUp.duration(200) : undefined}
          >
            <CustomText style={{ fontSize: 16, color: color.white }}>
              {arrLength} {title} Selected
            </CustomText>
          </AnimatedView>

          <AnimatedView
            style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            entering={
              isWithAnimation ? FadeInDown.duration(300).delay(100) : undefined
            }
            exiting={isWithAnimation ? FadeOutUp.duration(200) : undefined}
          >
            {!!onPressToDelete && (
              <AnimatedTouchableOpacity
                entering={
                  isWithAnimation
                    ? BounceIn.duration(400).delay(150)
                    : undefined
                }
                exiting={isWithAnimation ? BounceOut.duration(300) : undefined}
                style={{
                  padding: 10,
                  ...iconWrapperStyle,
                  borderWidth: 1,
                  borderColor: color.strokeColor,
                }}
                onPress={!!onPressToDelete ? onPressToDelete : undefined}
              >
                <MaterialIcons
                  name="delete-outline"
                  size={24}
                  color={color.mainTxtColor}
                />
              </AnimatedTouchableOpacity>
            )}

            {!!onPressToEdit && (
              <AnimatedTouchableOpacity
                entering={
                  isWithAnimation
                    ? BounceIn.duration(400).delay(200)
                    : undefined
                }
                exiting={isWithAnimation ? BounceOut.duration(300) : undefined}
                style={{ padding: 10 }}
                onPress={!!onPressToEdit ? onPressToEdit : undefined}
              >
                <EditIcon />
              </AnimatedTouchableOpacity>
            )}

            {!!onPressToAssignLead && (
              <AnimatedTouchableOpacity
                entering={
                  isWithAnimation
                    ? BounceIn.duration(400).delay(250)
                    : undefined
                }
                exiting={isWithAnimation ? BounceOut.duration(300) : undefined}
                style={{
                  paddingHorizontal: 10,
                  ...iconWrapperStyle,
                  borderColor: color.strokeColor,
                }}
                onPress={
                  !!onPressToAssignLead ? onPressToAssignLead : undefined
                }
              >
                <FontAwesome5
                  name="clipboard-list"
                  size={24}
                  color={color.mainTxtColor}
                />
              </AnimatedTouchableOpacity>
            )}
          </AnimatedView>
        </View>
      )}
    </LinearGradient>
  );
};

export default TitleWithAddDelete;

const styles = StyleSheet.create({
  gradientBackground: {
    width: "100%",
  },
});
