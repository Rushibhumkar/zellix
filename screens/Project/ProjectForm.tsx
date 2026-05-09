import {
  ActivityIndicator,
  RefreshControl,
  View,
  StyleSheet,
  Platform,
  Switch,
  Pressable,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import Container from "../../myComponents/Container/Container";
import Header from "../../components/Header";
import { useFormik } from "formik";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import { useGetApproveUser } from "./useQuery/useProject";
import { debounce } from "../../utils/debounce";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import { addProject, updateProject } from "../../services/rootApi/projectApi";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { routeProject } from "../../utils/routes";
import { addProjectSchema } from "../../utils/validation";
import ScrollViewWithKeyboardAvoid from "../../myComponents/ScrollViewWithKeyboardAvoid/ScrollViewWithKeyboardAvoid";
import CustomText from "../../myComponents/CustomText/CustomText";
import { myConsole } from "../../hooks/useConsole";
import { useAppToast } from "../../components/AppToast";

const source = [
  { _id: "tiktok", name: "Tik Tok" },
  { _id: "facebook", name: "Facebook" },
];

const ProjectForm = () => {
  const queryClient = useQueryClient();
  const { navigate, goBack } = useNavigation();
  const { params } = useRoute() || {};
  const detail = params?.detail;
  const toast = useAppToast();

  const [searchValue, setSearchValue] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const debounceSearch = useCallback(
    debounce((value) => setDebouncedSearch(value), 500),
    [],
  );

  const userListQuery = useGetApproveUser({ search: debouncedSearch });
  myConsole("detail?.membersssss", detail?.members);
  // 🔥 MAIN STATE (IMPORTANT)
  const [members, setMembers] = useState(
    detail?.members?.map((m) => ({
      user: m?.user?._id || m?.user,
      isActive: m?.isActive ?? true,
      weight: m?.weight || 1,
    })) || [],
  );

  const formik = useFormik({
    validationSchema: addProjectSchema,
    initialValues: {
      formId: detail?.formId || "",
      pageName: detail?.pageName || "",
      projectName: detail?.projectName || "",
      source: detail?.source || "",
      srManager: detail?.srManager?._id || detail?.srManager || "",
      // status: detail?.status || "",
      // isActive: detail?.isActive ?? true,
      isRoadShow: detail?.isRoadShow ?? false,
      members:
        detail?.members?.map((m) => ({
          user: m?.user?._id || m?.user,
          isActive: m?.isActive ?? true,
          weight: m?.weight || 1,
        })) || [],
    },

    onSubmit: async (v) => {
      try {
        const payload = {
          ...v,
          members: v.members,
        };

        let res;
        if (detail?._id) {
          res = await updateProject({
            data: payload,
            id: detail?._id,
          });
          if (res?.success) {
            queryClient.invalidateQueries({
              queryKey: ["getProjectById", detail?._id],
            });
          }
        } else {
          res = await addProject({ data: payload });
        }
        if (!res?.success) {
          toast.error(res?.message);
          return;
        }

        queryClient.invalidateQueries({ queryKey: ["getProjectList"] });
        toast.success(res?.message);
        goBack();
      } catch (e) {
        console.log("submit error", e);
      }
    },
  });

  // 🔥 ADD MEMBERS
  const handleAddMembers = (ids) => {
    const newMembers = ids.map((id) => ({
      user: id,
      isActive: true,
      weight: 1,
    }));

    const unique = [...members];

    newMembers.forEach((m) => {
      if (!unique.find((u) => u.user === m.user)) {
        unique.push(m);
      }
    });

    setMembers(unique);
  };

  // 🔥 TOGGLE ACTIVE
  const toggleMember = (id) => {
    setMembers((prev) =>
      prev.map((m) => (m.user === id ? { ...m, isActive: !m.isActive } : m)),
    );
  };

  // 🔥 REMOVE MEMBER
  const removeMember = (id) => {
    setMembers((prev) => prev.filter((m) => m.user !== id));
  };

  const handleSearchChange = (v) => {
    setSearchValue(v);
    debounceSearch(v);
  };

  const initialMemberIds = new Set(
    detail?.members?.map((m) => m?.user?._id || m?.user) || [],
  );

  useEffect(() => {
    formik.setFieldValue("members", members);
  }, [members]);
  myConsole("formikvalues", formik.values);
  myConsole("membersssss", members);
  return (
    <Container>
      <Header title={detail ? "Update Project" : "Add Project"} />

      <ScrollViewWithKeyboardAvoid isAndroidIssue={Platform.OS === "android"}>
        <View style={styles.container}>
          <CustomInput
            label="Project Name"
            value={formik.values.projectName}
            onChangeText={formik.handleChange("projectName")}
          />

          <CustomInput
            label="Form ID"
            value={formik.values.formId}
            onChangeText={formik.handleChange("formId")}
          />

          <CustomInput
            label="Page Name"
            value={formik.values.pageName}
            onChangeText={formik.handleChange("pageName")}
          />

          <DropdownRNE
            label="Sr Manager"
            keyName="sr_manager"
            onChange={(v) => formik.setFieldValue("srManager", v)}
            initialValue={formik.values.srManager}
            mode="modal"
          />

          <DropdownRNE
            label="Source"
            arrOfObj={source}
            onChange={(v) => formik.setFieldValue("source", v)}
            initialValue={formik.values.source}
            mode="modal"
          />

          {/* <CustomInput
            label="Status"
            value={formik.values.status}
            onChangeText={formik.handleChange("status")}
          /> */}

          {/* 🔥 ADD MEMBERS DROPDOWN */}
          <DropdownRNE
            arrOfObj={userListQuery?.data || []}
            label="Add Members"
            isMultiSelect
            isSearch
            showSelectedMembers={false}
            onChange={handleAddMembers}
            onChangeText={handleSearchChange}
          />

          {/* 🔥 MEMBERS LIST */}
          <View style={{ marginTop: 15 }}>
            {members.map((m: any) => {
              const userFromList = userListQuery?.data?.find(
                (u) => u._id === m.user,
              );
              const isOldMember = initialMemberIds.has(m.user);

              // 🔥 find from detail also
              const userFromDetail = detail?.members?.find(
                (d) => (d?.user?._id || d?.user) === m.user,
              )?.user;

              const user = userFromList || userFromDetail;

              const fullName = user?.name
                ? `${user?.name || ""} ${user?.lastName || ""}`
                : "Unknown";
              return (
                <View key={m.user} style={styles.memberRow}>
                  <CustomText style={styles.memberName}>{fullName}</CustomText>

                  <View style={styles.row}>
                    <Switch
                      value={m.isActive}
                      onValueChange={() => toggleMember(m.user)}
                    />

                    <Pressable
                      onPress={() => {
                        if (!isOldMember) removeMember(m.user);
                      }}
                      disabled={isOldMember}
                    >
                      <CustomText
                        style={[
                          styles.removeText,
                          isOldMember && styles.removeDisabled,
                        ]}
                      >
                        Remove
                      </CustomText>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>

          <CustomBtn title="Submit" onPress={formik.handleSubmit} />
        </View>
      </ScrollViewWithKeyboardAvoid>
    </Container>
  );
};

export default ProjectForm;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 120,
    gap: 12,
  },

  memberRow: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  memberName: {
    fontSize: 14,
    fontWeight: "600",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  removeText: {
    color: "red",
    marginLeft: 10,
  },

  removeDisabled: {
    color: "#999",
  },
});
