import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomText from "../../../myComponents/CustomText/CustomText";
import { useAppToast } from "../../../components/AppToast";
import {
  addLeadsToFolder,
  createLeadFolder,
  deleteLeadFolder,
  getLeadFolders,
  removeLeadsFromFolder,
  updateLeadFolder,
} from "../../../services/rootApi/leadApi";
import { queryKeyCRM } from "../../../utils/queryKeys";

const COLORS = [
  "#2E67BE",
  "#7C3AED",
  "#DB2777",
  "#DC2626",
  "#EA580C",
  "#CA8A04",
  "#16A34A",
  "#0891B2",
  "#4F46E5",
  "#475569",
];
const getError = (error: any, fallback: string) =>
  error?.response?.data?.message ||
  error?.response?.data ||
  error?.message ||
  fallback;

export const useLeadFolders = () =>
  useQuery({
    queryKey: ["leadFolders"],
    queryFn: getLeadFolders,
    staleTime: 30_000,
  });

export const LeadFolderBar = ({
  selectedFolderId,
  selectedFolderLeadCount,
  onChangeFolder,
  onManage,
}: any) => {
  const { data: folders = [], refetch: refetchFolders } = useLeadFolders();
  const selectFolder = (folderId: string) => {
    onChangeFolder(folderId);
    refetchFolders();
  };
  return (
    <View style={styles.barRow}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.folderScroll}
        contentContainerStyle={styles.bar}
      >
        <TouchableOpacity
          onPress={() => selectFolder("")}
          style={[styles.chip, !selectedFolderId && styles.allChip]}
        >
          <CustomText
            style={[
              styles.chipText,
              !selectedFolderId && styles.selectedChipText,
            ]}
          >
            All
          </CustomText>
        </TouchableOpacity>
        {folders.map((folder: any) => {
          const selected = selectedFolderId === folder._id;
          return (
            <TouchableOpacity
              key={folder._id}
              onPress={() => selectFolder(folder._id)}
              style={[
                styles.chip,
                selected && {
                  backgroundColor: folder.color,
                  borderColor: folder.color,
                },
                !selected && { borderColor: `${folder.color}90` },
              ]}
            >
              <View
                style={[
                  styles.dot,
                  { backgroundColor: selected ? "#fff" : folder.color },
                ]}
              />
              <CustomText
                style={[styles.chipText, selected && styles.selectedChipText]}
                numberOfLines={1}
              >
                {folder.name} (
                {selected && Number.isFinite(selectedFolderLeadCount)
                  ? selectedFolderLeadCount
                  : folder.leadCount}
                )
              </CustomText>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      <TouchableOpacity
        accessibilityLabel="Manage folders"
        onPress={onManage}
        style={styles.manageChip}
      >
        <Feather name="folder-plus" size={18} color="#2E67BE" />
      </TouchableOpacity>
    </View>
  );
};

export const LeadFoldersModal = ({
  visible,
  onClose,
  leadIds = [],
  selectedFolderId = "",
  onCompleted,
}: any) => {
  const queryClient = useQueryClient();
  const toast = useAppToast();
  const { data: folders = [], isLoading } = useLeadFolders();
  const [formVisible, setFormVisible] = useState(false);
  const [editingFolder, setEditingFolder] = useState<any>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["leadFolders"] });
    await queryClient.invalidateQueries({ queryKey: [queryKeyCRM.getLead] });
    onCompleted?.();
  };
  const openCreate = () => {
    setEditingFolder(null);
    setName("");
    setColor(COLORS[folders.length % COLORS.length]);
    setFormVisible(true);
  };
  const openEdit = (folder: any) => {
    setEditingFolder(folder);
    setName(folder.name);
    setColor(folder.color);
    setFormVisible(true);
  };
  const save = async () => {
    if (!name.trim()) return toast.error("Please enter a folder name");
    setLoading(true);
    try {
      if (editingFolder)
        await updateLeadFolder(editingFolder._id, { name: name.trim(), color });
      else await createLeadFolder({ name: name.trim(), color });
      toast.success(editingFolder ? "Folder updated" : "Folder created");
      setFormVisible(false);
      await refresh();
    } catch (error) {
      toast.error(getError(error, "Unable to save folder"));
    } finally {
      setLoading(false);
    }
  };
  const addToFolder = async (folderId: string) => {
    if (!leadIds.length) return;
    setLoading(true);
    try {
      const result = await addLeadsToFolder(folderId, leadIds);
      toast.success(result?.message || "Leads added to folder");
      await refresh();
      onClose();
    } catch (error) {
      toast.error(getError(error, "Unable to add leads to folder"));
    } finally {
      setLoading(false);
    }
  };
  const removeFromFolder = async () => {
    if (!selectedFolderId || !leadIds.length) return;
    setLoading(true);
    try {
      const result = await removeLeadsFromFolder(selectedFolderId, leadIds);
      toast.success(result?.message || "Leads removed from folder");
      await refresh();
      onClose();
    } catch (error) {
      toast.error(getError(error, "Unable to remove leads from folder"));
    } finally {
      setLoading(false);
    }
  };
  const removeFolder = (folder: any) =>
    Alert.alert(
      "Delete folder?",
      `“${folder.name}” will be deleted. The leads will not be deleted.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteLeadFolder(folder._id);
              toast.success("Folder deleted");
              await refresh();
            } catch (error) {
              toast.error(getError(error, "Unable to delete folder"));
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  const assigning = leadIds.length > 0;
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.modalHeader}>
            <View>
              <CustomText style={styles.modalTitle}>
                {assigning ? "Add leads to folder" : "Manage lead folders"}
              </CustomText>
              <CustomText style={styles.modalSubTitle}>
                {assigning
                  ? `${leadIds.length} selected lead(s)`
                  : "Up to 10 private folders"}
              </CustomText>
            </View>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="#475569" />
            </TouchableOpacity>
          </View>
          {selectedFolderId && assigning && (
            <TouchableOpacity
              disabled={loading}
              style={styles.removeButton}
              onPress={removeFromFolder}
            >
              <Feather name="folder-minus" color="#B91C1C" size={17} />
              <CustomText style={styles.removeText}>
                Remove from selected folder
              </CustomText>
            </TouchableOpacity>
          )}
          <ScrollView contentContainerStyle={styles.folderList}>
            {isLoading ? (
              <ActivityIndicator color="#2E67BE" />
            ) : (
              folders.map((folder: any) => (
                <View key={folder._id} style={styles.folderRow}>
                  <View
                    style={[
                      styles.folderColor,
                      { backgroundColor: folder.color },
                    ]}
                  />
                  <View style={{ flex: 1 }}>
                    <CustomText style={styles.folderName}>
                      {folder.name}
                    </CustomText>
                    <CustomText style={styles.folderCount}>
                      {folder.leadCount} lead(s)
                    </CustomText>
                  </View>
                  {assigning ? (
                    <TouchableOpacity
                      style={[
                        styles.addButton,
                        { backgroundColor: folder.color },
                      ]}
                      onPress={() => addToFolder(folder._id)}
                      disabled={loading}
                    >
                      <CustomText style={styles.addButtonText}>Add</CustomText>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity
                        onPress={() => openEdit(folder)}
                        style={styles.iconButton}
                      >
                        <Feather name="edit-2" size={17} color="#2E67BE" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => removeFolder(folder)}
                        style={styles.iconButton}
                      >
                        <Feather name="trash-2" size={17} color="#DC2626" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              ))
            )}
          </ScrollView>
          {!assigning && (
            <TouchableOpacity
              style={styles.createButton}
              onPress={openCreate}
              disabled={folders.length >= 10 || loading}
            >
              <Feather name="folder-plus" size={18} color="#fff" />
              <CustomText style={styles.createText}>
                {folders.length >= 10 ? "Maximum 10 folders" : "Create folder"}
              </CustomText>
            </TouchableOpacity>
          )}
          <Modal
            visible={formVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setFormVisible(false)}
          >
            <KeyboardAvoidingView
              style={styles.formOverlay}
              behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
              <View style={styles.formCard}>
                <CustomText style={styles.formTitle}>
                  {editingFolder ? "Edit folder" : "Create folder"}
                </CustomText>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Folder name"
                  maxLength={60}
                  autoFocus
                />
                <View style={styles.colors}>
                  {COLORS.map((value) => (
                    <TouchableOpacity
                      key={value}
                      onPress={() => setColor(value)}
                      style={[
                        styles.colorCircle,
                        { backgroundColor: value },
                        color === value && styles.selectedColor,
                      ]}
                    />
                  ))}
                </View>
                <View style={styles.formActions}>
                  <TouchableOpacity onPress={() => setFormVisible(false)}>
                    <CustomText style={styles.cancelText}>Cancel</CustomText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={save}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <CustomText style={styles.saveText}>Save</CustomText>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </Modal>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  barRow: { flexDirection: "row", alignItems: "center" },
  folderScroll: { flex: 1 },
  bar: {
    paddingLeft: 14,
    paddingRight: 8,
    paddingVertical: 10,
    gap: 8,
    alignItems: "center",
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#D7E2F4",
    backgroundColor: "#fff",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 18,
    maxWidth: 180,
  },
  allChip: { backgroundColor: "#2E67BE", borderColor: "#2E67BE" },
  chipText: { fontSize: 12, color: "#334155" },
  selectedChipText: { color: "#fff" },
  dot: { width: 7, height: 7, borderRadius: 4 },
  manageChip: {
    width: 44,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderLeftColor: "#D7E2F4",
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#00000066",
  },
  modal: {
    position: "relative",
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "82%",
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
  },
  modalTitle: { fontSize: 19, fontWeight: "700", color: "#1E293B" },
  modalSubTitle: { fontSize: 13, color: "#64748B", marginTop: 3 },
  folderList: { padding: 14, gap: 10 },
  folderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  folderColor: { width: 13, height: 34, borderRadius: 7 },
  folderName: { fontSize: 15, color: "#1E293B", fontWeight: "700" },
  folderCount: { fontSize: 12, color: "#64748B", marginTop: 2 },
  iconButton: { padding: 7 },
  addButton: { paddingHorizontal: 13, paddingVertical: 7, borderRadius: 8 },
  addButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  removeButton: {
    margin: 14,
    marginBottom: 0,
    padding: 11,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 7,
  },
  removeText: { color: "#B91C1C", fontWeight: "700", fontSize: 13 },
  createButton: {
    marginHorizontal: 14,
    marginTop: 4,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#2E67BE",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  createText: { color: "#fff", fontWeight: "700" },
  formOverlay: {
    flex: 1,
    backgroundColor: "#00000077",
    justifyContent: "center",
    padding: 24,
  },
  formCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20 },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 15,
    color: "#1E293B",
  },
  colors: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 11,
    marginVertical: 18,
  },
  colorCircle: {
    height: 28,
    width: 28,
    borderRadius: 14,
    borderWidth: 3,
    borderColor: "transparent",
  },
  selectedColor: { borderColor: "#0F172A", transform: [{ scale: 1.15 }] },
  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 22,
  },
  cancelText: { color: "#475569", fontWeight: "700" },
  saveButton: {
    backgroundColor: "#2E67BE",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9,
    minWidth: 72,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "700" },
});
