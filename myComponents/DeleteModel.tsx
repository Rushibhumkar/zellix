import { View, StyleSheet, Dimensions } from "react-native";
import React from "react";
import CustomModal from "./CustomModal/CustomModal";
import { color } from "../const/color";
import { AntDesign } from "@expo/vector-icons";
import CustomBtn from "./CustomBtn/CustomBtn";
import CustomText from "./CustomText/CustomText";
import { sizes } from "../const";

const { width } = Dimensions.get("window");

const DeleteModel = ({
  modalVisible,
  toggleModal,
  isLoading,
  handleDeleteUser,
  selectedUser,
}: any) => {
  return (
    <View>
      <CustomModal visible={modalVisible} onClose={toggleModal} hasBackdrop>
        <View style={styles.container}>
          {/* Warning Icon */}
          <View style={styles.iconContainer}>
            <AntDesign name="warning" size={22} color="red" />
          </View>

          {/* Title */}
          <CustomText style={styles.title}>
            Are you sure you want to delete {selectedUser}?
          </CustomText>

          {/* Buttons */}
          <View style={styles.btnRow}>
            <CustomBtn
              textStyle={{ fontSize: 14 }}
              title="Cancel"
              onPress={toggleModal}
            />
            <CustomBtn
              textStyle={{ fontSize: 14 }}
              title="Delete"
              isLoading={isLoading}
              onPress={handleDeleteUser}
            />
          </View>
        </View>
      </CustomModal>
    </View>
  );
};

export default DeleteModel;

// ---------------- STYLES ----------------

const styles = StyleSheet.create({
  container: {
    backgroundColor: color.white,
    width: width * 0.85, // 85% of screen width
    maxWidth: 400,
    minWidth: 260,
    borderRadius: 18,
    paddingVertical: 25,
    paddingHorizontal: 20,
    alignSelf: "center",
  },

  iconContainer: {
    padding: 10,
    backgroundColor: "rgb(222, 196, 196)",
    borderRadius: 40,
    height: 50,
    width: 50,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 15,
  },

  title: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: color.mainTxtColor,
    paddingHorizontal: 10,
    marginBottom: 25,
  },

  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
});
