import { myConsole } from "../../hooks/useConsole";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { axiosInstance } from "../authApi/axiosInstance";

export const getProjectList = async ({
  pageParam = 1,
  search = "",
  limit = 20,
  pagination = true,
}) => {
  try {
    const response = await axiosInstance.get("/api/campaign", {
      params: {
        page: pageParam,
        limit,
        pagination,
        search,
        type: "project",
      },
    });

    const data = response?.data || {};

    return {
      data: data?.data || [],
      pagination: data?.pagination || {},
    };
  } catch (err) {
    console.log("getProjectListErr", err);
    return {
      data: [],
      pagination: {},
    };
  }
};

export const getProjectById = async (id: any) => {
  try {
    const response = await axiosInstance.get(`api/campaign/${id}`);
    return response.data;
  } catch (err) {
    console.log("getProjectDetailErr", err);
  }
};

interface TupdateProject {
  id?: string;
  data: {
    formId: string;
    members: string[];
    pageName: string;
    projectName: string;
    source: string;
    srManager: string;
  };
}

export const addProject = async ({ data }: TupdateProject) => {
  try {
    const response = await axiosInstance.post(`api/campaign`, data);
    return {
      success: true,
      message: "Campaign created successfully",
      data: response.data,
    };
  } catch (err) {
    return {
      success: false,
      message: err?.response?.data?.message || "Failed to create campaign",
    };
  }
};

export const updateProject = async ({ id, data }: TupdateProject) => {
  try {
    const response = await axiosInstance.patch(
      `api/campaign/${id}/update`,
      data,
    );
    return {
      success: true,
      message: "Campaign updated successfully",
      data: response.data,
    };
  } catch (err) {
    return {
      success: false,
      message: err?.response?.data?.message || "Failed to update campaign",
    };
  }
};

interface TDeleteProject {
  idArr: any;
}

export const deleteProject = async ({ idArr }: TDeleteProject) => {
  try {
    const response = await axiosInstance.post(`api/project/deleteProjects`, {
      ids: idArr,
    });
    popUpConfToast.successMessage(response?.data?.message || "Internal Error");
    return response.data;
  } catch (err) {
    popUpConfToast.errorMessage(err?.response?.data || "Internal Error");
    console.log("deleteProjectErrPag", err);
  }
};

export const toggleProjectActiveStatus = async ({
  id,
  data,
}: {
  id: string;
  data: { isActive: boolean; activeStatus: boolean };
}) => {
  try {
    const response = await axiosInstance.patch(
      `api/campaign/${id}/update`,
      data,
    );
    return {
      success: true,
      message: data.isActive
        ? "Campaign activated successfully"
        : "Campaign deactivated successfully",
      data: response.data,
    };
  } catch (err) {
    return {
      success: false,
      message:
        err?.response?.data?.message || "Failed to update campaign status",
    };
  }
};
