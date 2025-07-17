import { View, Text, StyleSheet } from "react-native";
import React from "react";
import CustomModal from "./CustomModal/CustomModal";
import { color } from "../const/color";
import { AntDesign } from "@expo/vector-icons";
import CustomBtn from "./CustomBtn/CustomBtn";

const DeleteModel = ({
  modalVisible,
  toggleModal,
  isLoading,
  handleDeleteUser,
  selectedUser,
}) => {
  return (
    <View>
      <CustomModal
        visible={modalVisible}
        onClose={toggleModal}
        hasBackdrop={false}
      >
        <View
          style={{
            backgroundColor: color.white,

            minWidth: 100,
            minHeight: 100,
            borderRadius: 20,
            padding: 20,
          }}
        >
          <View>
            <View
              style={{
                flexDirection: "row",
                gap: 10,
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              <View
                style={{
                  padding: 5,
                  backgroundColor: "rgb(222, 196, 196)",
                  borderRadius: 25,
                  height: 40,
                  width: 40,
                }}
              >
                <AntDesign
                  name="warning"
                  size={20}
                  color="red"
                  style={{ textAlign: "center", marginTop: 4 }}
                />
              </View>
              <View style={{ marginTop: 5 }}>
                <Text style={{ textAlign: "center", fontSize: 16, fontWeight:600 }}>
                  Are you Sure, You Want to Delete {selectedUser}
                </Text>

                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 25,
                    gap: 10,
                    justifyContent: "space-between",
                  }}
                >
                  <CustomBtn
                    textStyle={{ fontSize: 15, color: "black" }}
                    title="Cancel"
                    onPress={toggleModal}
                    containerStyle={{
                      backgroundColor: "white",
                      borderColor: "black",
                      borderWidth: 0.5,
                    }}
                  />
                  <CustomBtn
                    textStyle={{ fontSize: 15 }}
                    title="Delete"
                    containerStyle={{
                      backgroundColor: "rgb(211,46,47)",
                    }}
                    isLoading={isLoading}
                    onPress={handleDeleteUser}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </CustomModal>
    </View>
  );
};

export default DeleteModel;
