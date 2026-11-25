import {
  addLead,
  addLeadsToFolder,
  createLeadFolder,
  deleteLead,
  deleteLeadFolder,
  getLead,
  getLeadDetailById,
  getLeadFolders,
  removeLeadsFromFolder,
  updateLead,
  updateLeadFolder,
} from "./leadApi";

const forceCallingData = (payload: any) => {
  const data = payload?.data;
  return {
    ...payload,
    data: Array.isArray(data)
      ? data.map((item) => ({ ...item, type: "calling_data" }))
      : { ...(data || {}), type: "calling_data" },
  };
};

export const getCallingData = (params: any) =>
  getLead({ ...params, type: "calling_data" });
export const getCallingDataById = (id: string, summary = false) =>
  getLeadDetailById(id, summary, "calling_data");
export const createCallingData = (payload: any, toast?: any) =>
  addLead(forceCallingData(payload), toast);
export const updateCallingData = (payload: any, toast?: any) =>
  updateLead({ ...payload, data: forceCallingData(payload.data) }, toast);
export const deleteCallingData = (ids: string[]) => deleteLead(ids, "calling_data");
export const getCallingDataFolders = (signal?: AbortSignal) =>
  getLeadFolders("calling_data", signal);
export const createCallingDataFolder = (payload: any) =>
  createLeadFolder({ ...payload, type: "calling_data" });
export const updateCallingDataFolder = (id: string, payload: any) =>
  updateLeadFolder(id, payload, "calling_data");
export const deleteCallingDataFolder = (id: string) =>
  deleteLeadFolder(id, "calling_data");
export const addCallingDataToFolder = (folderId: string, ids: string[]) =>
  addLeadsToFolder(folderId, ids, "calling_data");
export const removeCallingDataFromFolder = (folderId: string, ids: string[]) =>
  removeLeadsFromFolder(folderId, ids, "calling_data");
