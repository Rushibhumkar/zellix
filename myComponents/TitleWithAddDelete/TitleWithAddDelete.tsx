import { AntDesign, Feather } from "@expo/vector-icons";
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
import { shadowPrimaryColor } from "../../const/globalStyle";

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
}: TTitleWithAddDelete) => {
  return (
    <LinearGradient
      colors={["#2452FA", "#6CA8FF"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradientBackground}
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
              <TouchableOpacity onPress={onSelectLeadType}>
                <AntDesign
                  name="filter"
                  size={35}
                  color={color.saffronMango}
                  style={{
                    marginEnd: 10,
                  }}
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
                  paddingVertical: 5,
                  width: 180,
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
                paddingVertical: 6,
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
            paddingTop: 20,
          }}
        >
          <CustomText style={{ fontSize: 18, fontWeight: 500 }}>
            {arrLength} {title} Selected
          </CustomText>
          <View
            style={{ flexDirection: "row", alignItems: "center" }}
            // onPress={handleDeleteBooking}
            // onPress={!!onPressToDelete ? onPressToDelete : undefined}
          >
            {!!onPressToDelete && (
              <TouchableOpacity
                style={{ padding: 10 }}
                onPress={!!onPressToDelete ? onPressToDelete : undefined}
              >
                <DeleteIcon />
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
                style={{ padding: 10 }}
                onPress={
                  !!onPressToAssignLead ? onPressToAssignLead : undefined
                }
              >
                <LeadAssignIcon />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </LinearGradient>
  );
};

export default TitleWithAddDelete;

const styles = StyleSheet.create({
  gradientBackground: {
    width: "100%",
    // paddingTop: Platform.OS === "ios" ? 12 : 12, // ensures gradient extends behind translucent StatusBar
    paddingBottom: 20,
    // borderBottomLeftRadius: 24,
    // borderBottomRightRadius: 24,
  },
});
