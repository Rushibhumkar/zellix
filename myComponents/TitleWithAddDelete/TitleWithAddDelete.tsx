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
import DeleteIcon from "../../assets/svg/DeleteIcon";
import EditIcon from "../../assets/svg/EditIcon";
import LeadAssignIcon from "../../assets/svg/LeadAssignIcon";
import ASFilterIcon from "../../assets/svg/ASFilterIcon";
import { color } from "../../const/color";
import CustomText from "../CustomText/CustomText";
import { LinearGradient } from "expo-linear-gradient";
import { iconWrapperStyle, shadowPrimaryColor } from "../../const/globalStyle";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";

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
}: TTitleWithAddDelete) => {
  return (
    <>
      {isWithAnimation ? (
        <Animated.View
          entering={FadeInDown.duration(400)}
          exiting={FadeOutUp.duration(300)}
        >
          <LinearGradient
            colors={["#2452FA", "#6CA8FF"]}
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
                // onPress={() => navigate("DeveloperInformation")}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  {!!onSelectLeadType && (
                    <TouchableOpacity
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
                      <FontAwesome
                        name="exchange"
                        size={24}
                        color={color.white}
                      />
                    </TouchableOpacity>
                  )}
                  {!!onPressToFilter && (
                    <TouchableOpacity
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
                            ? 170
                            : 140
                          : 180,
                      }}
                    >
                      <Feather name="filter" color={"#fff"} size={18} />
                      <CustomText style={{ color: "#fff" }}>Filter</CustomText>
                    </TouchableOpacity>
                  )}
                  {!!onCloseSearch && (
                    <TouchableOpacity
                      onPress={!!onCloseSearch ? onCloseSearch : undefined}
                    >
                      <AntDesign
                        name="close"
                        size={30}
                        color={color.saffronMango}
                        style={{
                          marginLeft: 10,
                        }}
                      />
                    </TouchableOpacity>
                  )}
                </View>
                {showAddBtn && (
                  <TouchableOpacity
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
                    onPress={
                      !!onPressToNavigate ? onPressToNavigate : undefined
                    }
                  >
                    <AntDesign
                      name="plus"
                      size={16}
                      color={color.primaryColor}
                    />
                    <View>
                      <CustomText
                        style={{
                          color: color.primaryColor,
                        }}
                      >
                        Add {title ?? "title"}
                      </CustomText>
                      {/* <View style={styles.divider}></View> */}
                    </View>
                  </TouchableOpacity>
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
                <CustomText style={{ fontSize: 16, color: color.white }}>
                  {arrLength} {title} Selected
                </CustomText>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                  // onPress={handleDeleteBooking}
                  // onPress={!!onPressToDelete ? onPressToDelete : undefined}
                >
                  {!!onPressToDelete && (
                    <TouchableOpacity
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
                    </TouchableOpacity>
                  )}
                  {!!onPressToEdit && (
                    <TouchableOpacity
                      style={{ padding: 10 }}
                      onPress={!!onPressToEdit ? onPressToEdit : undefined}
                    >
                      <EditIcon />
                    </TouchableOpacity>
                  )}

                  {!!onPressToAssignLead && (
                    <TouchableOpacity
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
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </LinearGradient>
        </Animated.View>
      ) : (
        <LinearGradient
          colors={["#2452FA", "#6CA8FF"]}
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
              // onPress={() => navigate("DeveloperInformation")}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                {!!onSelectLeadType && (
                  <TouchableOpacity
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
                    <FontAwesome
                      name="exchange"
                      size={24}
                      color={color.white}
                    />
                  </TouchableOpacity>
                )}
                {!!onPressToFilter && (
                  <TouchableOpacity
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
                          ? 170
                          : 140
                        : 180,
                    }}
                  >
                    <Feather name="filter" color={"#fff"} size={18} />
                    <CustomText style={{ color: "#fff" }}>Filter</CustomText>
                  </TouchableOpacity>
                )}
                {!!onCloseSearch && (
                  <TouchableOpacity
                    onPress={!!onCloseSearch ? onCloseSearch : undefined}
                  >
                    <AntDesign
                      name="close"
                      size={30}
                      color={color.saffronMango}
                      style={{
                        marginLeft: 10,
                      }}
                    />
                  </TouchableOpacity>
                )}
              </View>
              {showAddBtn && (
                <TouchableOpacity
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
                    {/* <View style={styles.divider}></View> */}
                  </View>
                </TouchableOpacity>
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
              <CustomText style={{ fontSize: 16, color: color.white }}>
                {arrLength} {title} Selected
              </CustomText>
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                // onPress={handleDeleteBooking}
                // onPress={!!onPressToDelete ? onPressToDelete : undefined}
              >
                {!!onPressToDelete && (
                  <TouchableOpacity
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
                  </TouchableOpacity>
                )}
                {!!onPressToEdit && (
                  <TouchableOpacity
                    style={{ padding: 10 }}
                    onPress={!!onPressToEdit ? onPressToEdit : undefined}
                  >
                    <EditIcon />
                  </TouchableOpacity>
                )}

                {!!onPressToAssignLead && (
                  <TouchableOpacity
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
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        </LinearGradient>
      )}
    </>
  );
};

export default TitleWithAddDelete;

const styles = StyleSheet.create({
  gradientBackground: {
    width: "100%",
    // paddingTop: Platform.OS === "ios" ? 12 : 12, // ensures gradient extends behind translucent StatusBar
    // borderBottomLeftRadius: 24,
    // borderBottomRightRadius: 24,
  },
});
