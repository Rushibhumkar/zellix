import React, { useState } from "react";
import { View, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import moment from "moment";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { color } from "../../../const/color";
import { getInitials } from "../../../utils/commonFunctions";

const NotesSection = ({ comments, notes, onSave }: any) => {
  const [note, setNote] = useState("");

  return (
    <View>
      {/* 🔹 Lead Comments */}
      {!!comments && (
        <View style={styles.card}>
          <CustomText style={styles.heading}>Lead Comments</CustomText>
          <View style={styles.divider} />
          <CustomText style={styles.commentText}>{comments}</CustomText>
        </View>
      )}

      {/* 🔹 Notes List */}
      {Array.isArray(notes) &&
        notes.map((n, i) => (
          <View key={i} style={styles.card}>
            <View style={styles.row}>
              <View style={styles.avatar}>
                <CustomText style={styles.avatarText}>
                  {getInitials(n?.createdBy?.name || "")}
                </CustomText>
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.nameRow}>
                  <CustomText style={styles.name}>
                    {n?.createdBy?.name || "User"}
                  </CustomText>
                  <CustomText style={styles.date}>
                    {moment(n?.createdAt).format("MMM DD, YYYY")}
                  </CustomText>
                </View>
                <CustomText style={styles.noteText}>{n?.note}</CustomText>
              </View>
            </View>
          </View>
        ))}

      {/* 🔹 Add Note */}
      <View style={styles.card}>
        <CustomText style={styles.heading}>Add Note</CustomText>
        <TextInput
          placeholder="Type your note here..."
          value={note}
          onChangeText={setNote}
          multiline
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.saveBtn}
          onPress={() => {
            if (!note.trim()) return;
            onSave(note);
            setNote("");
          }}
        >
          <CustomText style={styles.saveText}>Save Note</CustomText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default NotesSection;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
    color: color.mainTxtColor,
  },
  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 10,
  },
  commentText: {
    fontSize: 14,
    color: "#4A5568",
    lineHeight: 22,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  avatar: {
    height: 40,
    width: 40,
    borderRadius: 20,
    backgroundColor: "#E6EEFF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontWeight: "700",
    color: color.mainTxtColor,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  name: {
    fontWeight: "600",
    fontSize: 15,
    color: color.mainTxtColor,
  },
  date: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  noteText: {
    marginTop: 4,
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 12,
    height: 100,
    marginTop: 12,
    textAlignVertical: "top",
  },
  saveBtn: {
    alignSelf: "flex-end",
    marginTop: 14,
    backgroundColor: "#AFC3E8",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
  },
  saveText: {
    color: "#fff",
    fontWeight: "600",
  },
});
