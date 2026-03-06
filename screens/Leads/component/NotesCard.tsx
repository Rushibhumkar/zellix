import {
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import CustomText from "../../../myComponents/CustomText/CustomText";
import moment from "moment";
import EditIcon from "../../../assets/svgHRM/EditIcon";
import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/userSlice";
import { roleEnum } from "../../../utils/data";
import { color } from "../../../const/color";
import { getInitials } from "../../../utils/commonFunctions";
import { Feather } from "@expo/vector-icons";
import {
  iconWrapperStyle,
  shadowPrimaryColor,
} from "../../../const/globalStyle";

interface TNotesCard {
  noteArr: any;
  onEdit: (a: { id: string; note: string }) => void;
  onDelete: (id: string) => void;
  isLoadingDelete: string;
}

const NotesCard = ({
  noteArr = [],
  onEdit,
  onDelete,
  isLoadingDelete,
}: TNotesCard) => {
  const { user } = useSelector(selectUser);

  const isSubSup =
    user?.role === roleEnum?.sub_admin || user?.role === roleEnum?.sup_admin;

  return (
    <View style={{ marginBottom: 20 }}>
      {noteArr?.map((item: any, i: number) => {
        return (
          <View key={i} style={styles.card}>
            {/* Top Row */}
            <View style={styles.topRow}>
              <View style={styles.leftSection}>
                {/* Avatar */}
                <View style={styles.avatar}>
                  <CustomText style={styles.avatarText}>
                    {getInitials(item?.createdByName || "")}
                  </CustomText>
                </View>

                {/* Name + Note */}
                <View style={{ flex: 1, paddingHorizontal: 8 }}>
                  {(isSubSup || item?.createdBy === user?._id) && (
                    <CustomText style={styles.nameText}>
                      {item?.createdByName || "N/A"}
                    </CustomText>
                  )}

                  <CustomText style={styles.noteText}>
                    {item?.note || "N/A"}
                  </CustomText>
                </View>
              </View>

              {/* Date */}
              <CustomText style={styles.dateText}>
                {item?.createdAt
                  ? moment(item?.createdAt).format("MMM DD, YYYY")
                  : "N/A"}
              </CustomText>
            </View>

            {(isSubSup || item?.createdBy === user?._id) && (
              <TouchableOpacity
                style={{
                  alignSelf: "flex-end",
                  ...iconWrapperStyle,
                }}
                onPress={() =>
                  onEdit({
                    note: item?.note || "",
                    id: item?._id || "",
                  })
                }
              >
                <Feather name="edit-2" size={18} color={color.mainTxtColor} />
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </View>
  );
};

export default NotesCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...shadowPrimaryColor,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  leftSection: {
    flexDirection: "row",
    flex: 1,
    gap: 12,
  },

  avatar: {
    height: 42,
    width: 42,
    borderRadius: 21,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2563EB",
  },

  nameText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2563EB",
    marginBottom: 4,
  },

  dateText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },

  noteText: {
    color: "#4B5563",
    lineHeight: 22,
    marginTop: 2,
  },

  editWrapper: {
    marginTop: 10,
    alignItems: "flex-end",
  },
});
