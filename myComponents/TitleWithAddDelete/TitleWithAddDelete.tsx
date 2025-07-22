import { AntDesign } from "@expo/vector-icons";
import React from "react";
import {
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
    <>
      {arrLength === 0 && (
        <Pressable
          style={{
            flexDirection: "row",
            gap: 10,
            marginHorizontal: 20,
            marginTop: 20,
            paddingBottom: 10,
            alignItems: "center",
            justifyContent: "space-between",
          }}
          // onPress={() => navigate("DeveloperInformation")}
        >
          {showAddBtn && (
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}
              onPress={!!onPressToNavigate ? onPressToNavigate : undefined}
            >
              <AntDesign name="plussquareo" size={30} color="#2D67C6" />
              <View>
                <Text
                  style={{
                    fontSize: 18,
                    color: "#2D67C6",
                    fontWeight: "700",
                    textDecorationLine: "underline",
                  }}
                >
                  Add {title ?? "title"}
                </Text>
                {/* <View style={styles.divider}></View> */}
              </View>
            </TouchableOpacity>
          )}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
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
              >
                <ASFilterIcon width={28} height={28} />
              </TouchableOpacity>
            )}
            {/* onCloseSearch */}
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
                {/* <ASFilterIcon
            width={28}
            height={28}
          /> */}
              </TouchableOpacity>
            )}
          </View>
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
          <Text style={{ fontSize: 18, fontWeight: 500 }}>
            {arrLength} {title} Selected
          </Text>
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
    </>
  );
};

export default TitleWithAddDelete;

const styles = StyleSheet.create({});
