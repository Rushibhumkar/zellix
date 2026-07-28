import { StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import CustomText from "../../../myComponents/CustomText/CustomText";
import moment from "moment";
import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/userSlice";
import { roleEnum } from "../../../utils/data";
import { color } from "../../../const/color";
import { getInitials } from "../../../utils/commonFunctions";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import {
  iconWrapperStyle,
  shadowPrimaryColor,
} from "../../../const/globalStyle";
import NoDataFound from "../../../myComponents/NoDataFound/NoDataFound";
import { sizes } from "../../../const";
import { myConsole } from "../../../hooks/useConsole";

interface TNotesCard {
  noteArr: any;
  onEdit: (a: { notesId: string; note: string }) => void;
  onDelete: (id: string) => void;
  isLoadingDelete: string;
  selectLeadType?: string;
}

const NotesCard = ({
  noteArr = [],
  onEdit,
  onDelete,
  isLoadingDelete,
  selectLeadType,
}: TNotesCard) => {
  const { user } = useSelector(selectUser);

  const isSubSup =
    user?.role === roleEnum?.sub_admin || user?.role === roleEnum?.sup_admin;
  const isSubSupManagerTeamLead =
    user?.role === roleEnum?.sub_admin ||
    user?.role === roleEnum?.sup_admin ||
    user?.role === roleEnum?.sr_manager ||
    user?.role === roleEnum?.team_lead;

  return (
    <View style={{ marginBottom: 20 }}>
      {(noteArr ?? []).length === 0 ? (
        <View style={styles.noDataContainer}>
          <NoDataFound width={140} height={140} />
        </View>
      ) : (
        noteArr.map((item: any, i: number) => {
          return (
            <View key={i} style={styles.card}>
              {/* Top Row: Avatar + Name + Date */}
              <View style={styles.topRow}>
                {(isSubSupManagerTeamLead || item?.createdBy === user?._id) && (
                  <View style={styles.avatar}>
                    <CustomText style={styles.avatarText}>
                      {getInitials(item?.createdByName || "")}
                    </CustomText>
                  </View>
                )}

                <View style={{ flex: 1, paddingHorizontal: 8 }}>
                  <View style={styles.nameDateRow}>
                    {(isSubSupManagerTeamLead ||
                      item?.createdBy === user?._id) && (
                      <CustomText style={styles.nameText}>
                        {item?.createdByName || "N/A"}
                      </CustomText>
                    )}
                    <CustomText style={styles.dateText}>
                      {item?.createdAt
                        ? moment(item?.createdAt).format(
                            "MMM DD, YYYY, hh:mm A",
                          )
                        : "N/A"}
                    </CustomText>
                  </View>

                  <CustomText style={styles.noteText}>
                    {item?.note || "N/A"}
                  </CustomText>
                </View>
              </View>

              {/* Action Buttons */}
              {(isSubSup || item?.createdBy === user?._id) && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() => onDelete(item?.notesId || item?._id)}
                  >
                    <MaterialIcons
                      name="delete-outline"
                      size={16}
                      color={color.mainTxtColor}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconBtn}
                    onPress={() =>
                      onEdit({
                        note: item?.note || "",
                        notesId: item?._id || "",
                      })
                    }
                  >
                    <Feather
                      name="edit-2"
                      size={16}
                      color={color.mainTxtColor}
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })
      )}
    </View>
  );
};

export default NotesCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    ...shadowPrimaryColor,
  },

  noDataContainer: {
    justifyContent: "center",
    alignItems: "center",
    minHeight: sizes.height / 2,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  nameDateRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  avatar: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: "#E0E7FF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },

  avatarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2563EB",
  },

  nameText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
  },

  dateText: {
    fontSize: 11,
    color: "#6B7280",
    fontWeight: "400",
  },

  noteText: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 20,
  },

  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-end",
    marginTop: 10,
  },

  iconBtn: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },

  editWrapper: {
    marginTop: 10,
    alignItems: "flex-end",
  },
});
