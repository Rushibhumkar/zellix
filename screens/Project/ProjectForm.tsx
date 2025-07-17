import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import React, { useState } from "react";
import Container from "../../myComponents/Container/Container";
import Header from "../../components/Header";
import { useFormik } from "formik";
import CustomInput from "../../myComponents/CustomInput/CustomInput";
import DropdownRNE from "../../myComponents/DropdownRNE/DropdownRNE";
import { useGetApproveUser } from "./useQuery/useProject";
import { myConsole } from "../../hooks/useConsole";
import { debounce } from "../../utils/debounce";
import CustomBtn from "../../myComponents/CustomBtn/CustomBtn";
import { addProject, updateProject } from "../../services/rootApi/projectApi";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigation, useRoute } from "@react-navigation/native";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { routeProject } from "../../utils/routes";
import { addProjectSchema } from "../../utils/validation";
import ScrollViewWithKeyboardAvoid from "../../myComponents/ScrollViewWithKeyboardAvoid/ScrollViewWithKeyboardAvoid";

const source = [
  { _id: "tiktok", name: "Tik Tok" },
  { _id: "facebook", name: "Facebook" },
  { _id: "whatsapp", name: "Whats App" },
  { _id: "snapchat", name: "Snapchat" },
  { _id: "google_ads", name: "Google Ads" },
  { _id: "bayut", name: "Bayut" },
  { _id: "dubizzle", name: "Dubizzle" },
];

const ProjectForm = () => {
  const queryClient = useQueryClient();
  const { navigate, goBack } = useNavigation();
  const { params } = useRoute() || {};
  const detail = params?.detail;
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const debounceSearch = React.useCallback(
    debounce((value) => setDebouncedSearch(value), 500),
    []
  );

  const userListQuery = useGetApproveUser({ search: "" });

  const formik = useFormik({
    validationSchema: addProjectSchema,
    initialValues: {
      formId: detail?.formId || "",
      members: detail?.members?.map((el) => el?._id) || [],
      pageName: detail?.pageName || "",
      projectName: detail?.projectName || "",
      source: detail?.source || "",
      srManager: detail?.srManager || "",
    },
    onSubmit: async (v) => {
      if (detail?._id) {
        const resPr = await updateProject({
          data: v,
          id: detail?._id,
        });
        console.log("resPr", resPr);
        queryClient.invalidateQueries({
          queryKey: ["getProjectById", detail?._id],
        });
        queryClient.invalidateQueries({
          queryKey: ["getProjectList"],
        });
        popUpConfToast.successMessage(resPr || "Succesful");
        goBack();
        // navigate(routeProject.ProjectList)
      } else {
        const resPr = await addProject({
          data: v,
        });
        queryClient.invalidateQueries({
          queryKey: ["getProjectList"],
        });
        popUpConfToast.successMessage(resPr || "Succesful");
        navigate(routeProject.ProjectList);
      }
    },
  });

  const handleSearchChange = (v) => {
    setSearchValue(v);
    debounceSearch(v);
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      userListQuery?.refetch();
    } catch (e) {
      console.log("refreshGetAllLeave", e);
    } finally {
      setRefreshing(false);
    }
  };

  const onEndReach = () => {
    if (
      userListQuery?.hasNextPage &&
      !userListQuery?.isLoading &&
      userListQuery?.data?.length > 0
    ) {
      userListQuery?.fetchNextPage && userListQuery.fetchNextPage();
    }
  };

  return (
    <Container>
      <Header title={"Add Project"} />
      <ScrollViewWithKeyboardAvoid isAndroidIssue={Platform.OS === "android"}>
        <View style={{ padding: 20, paddingBottom: 140 }}>
          <CustomInput
            label="Project Name"
            value={formik?.values?.projectName}
            onChangeText={formik?.handleChange("projectName")}
            containerStyle={{ marginBottom: 15 }}
            onBlur={formik?.handleBlur("projectName")}
          />
          {formik.errors.projectName && formik.touched.projectName && (
            <Text style={styles.errorText}>{formik.errors.projectName}</Text>
          )}
          <CustomInput
            label="Form ID"
            value={formik?.values?.formId}
            onChangeText={formik?.handleChange("formId")}
            containerStyle={{ marginBottom: 15 }}
            onBlur={formik?.handleBlur("formId")}
          />
          {formik.errors.formId && formik.touched.formId && (
            <Text style={styles.errorText}>{formik.errors.formId}</Text>
          )}
          <CustomInput
            placeholder="Page Name"
            value={formik?.values?.pageName}
            onChangeText={formik?.handleChange("pageName")}
            containerStyle={{ marginBottom: 15 }}
            label="Page Name"
            onBlur={formik?.handleBlur("pageName")}
          />
          {formik.errors.pageName && formik.touched.pageName && (
            <Text style={styles.errorText}>{formik.errors.pageName}</Text>
          )}

          <DropdownRNE
            keyValueShowInBox="name"
            keyValueGetOnSelect="_id"
            label={"Sr Manager"}
            keyName="sr_Manager"
            containerStyle={{ marginBottom: 15 }}
            onChange={(a) => formik.setFieldValue("srManager", a)}
            initialValue={formik.values?.srManager}
            onBlur={formik.handleBlur("srManager")}
            mode="modal"
          />
          {formik.errors.srManager && formik.touched.srManager && (
            <Text style={styles.errorText}>{formik.errors.srManager}</Text>
          )}

          <DropdownRNE
            label="Source"
            arrOfObj={source || []}
            containerStyle={{ marginBottom: 15 }}
            onChange={(a) => formik.setFieldValue("source", a)}
            initialValue={formik.values.source}
            onBlur={formik.handleBlur("source")}
            mode="modal"
          />
          {formik.errors.source && formik.touched.source && (
            <Text style={styles.errorText}>{formik.errors.source}</Text>
          )}
          <DropdownRNE
            arrOfObj={userListQuery?.data || []}
            label="Members"
            onChange={(a) => formik.setFieldValue("members", a)}
            containerStyle={{ marginBottom: 30 }}
            onBlur={formik.handleBlur("members")}
            initialValue={formik.values.members}
            isSearch
            maxHeight={300}
            mode="modal"
            //
            onEndReached={onEndReach}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              userListQuery?.isFetchingNextPage && (
                <ActivityIndicator size={"small"} color={"#002E6B"} />
              )
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            onChangeText={(v) => handleSearchChange(v)}
            isLoading={userListQuery?.isLoading}
            isMultiSelect
          />

          {formik.errors.members && formik.touched.members && (
            <Text style={styles.errorText}>{formik.errors.members}</Text>
          )}
          <CustomBtn
            title="Submit"
            onPress={formik.handleSubmit}
            isLoading={formik.isSubmitting}
          />
        </View>
      </ScrollViewWithKeyboardAvoid>
    </Container>
  );
};

export default ProjectForm;

const styles = StyleSheet.create({
  errorText: {
    color: "red",
    marginTop: -10,
    marginBottom: 8,
  },
});
