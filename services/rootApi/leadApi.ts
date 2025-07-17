import { err } from "react-native-svg/lib/typescript/xml"
import { axiosInstance } from "../authApi/axiosInstance"
import { myConsole } from "../../hooks/useConsole"
import { popUpConfToast } from "../../utils/toastModalByFunction"
import { popupModal2 } from "../../utils/toastFunction"
import { queryKeyCRM } from "../../utils/queryKeys"
import { useQuery, useQueryClient } from "@tanstack/react-query"
let a = {
    // clientEmail: "danish@gmail.com",
    // clientMobile: "91-1234567890",
    // clientName: "danish",
    // name: "javed",
    type: "calling_data",
    // whatsapp: "https://wa.me/1234567890",
    srManager: "654cd54188f83cd465c9e39d"
}


export const addLead = (data) => {
    return axiosInstance.post('/api/lead', data)
        // .then((res) => res?.data)
        .then(res => {
            myConsole('res?.data', res?.data)
            // popUpConfToast.successMessage(res?.data)
            return res?.data
        })
        .catch(err => {
            myConsole('errUpdateCase', err?.response?.data)
            throw new Error(err);
            // popUpConfToast.errorMessage('Server error')
        })
}

export const updateLead = ({ id, data }) => {
    return axiosInstance.put(`/api/lead/leadUpdateById/${id}`, data)
        // .then((res) => res?.data)
        .then(res => {
            // popUpConfToast.successMessage(res?.data)
            return res?.data
        })
        .catch(err => {
            myConsole('errUpdateCase', err?.response?.data)
            throw new Error(err);

            // popUpConfToast.errorMessage('Server error')
        })
}

export const deleteLead = (data: [string]) => {
    return axiosInstance.post('/api/lead/deleteLeadsByIds', data)
        // .then((res) => res)
        .then(res => {
            popUpConfToast.successMessage(res?.data)
            return res?.data
        })
        .catch(err => {
            myConsole('errUpdateCase', err?.response?.data)
            popUpConfToast.errorMessage('Server error')
        })
}

export const leadStatusUpdate = ({ id, data }) => {
    return axiosInstance.post(`/api/lead/statusUpdateById/${id}`, data)
        // .then((res) => res)
        .then(res => {
            // popUpConfToast.successMessage(res?.data)
            return res?.data
        })
        .catch(err => {
            throw new Error(err)
            // myConsole('errUpdateCase', err?.response?.data)
            // popUpConfToast.errorMessage('Server error')
        })
}

export const leadAssignById = (data) => {
    return axiosInstance.put(`/api/lead/leadAssignById`, data)
}

export const leadCallTrack = ({ id, data }) => {
    return axiosInstance.post(`/api/lead/updateCallLogById/${id}`, data)
}

export const getLeadDetailById = (id: string) => {
    return axiosInstance.get(`/api/lead/getLeadById/${id}`)
        .then((res) => res?.data)
}

export const getLead = async ({
    search = null,
    pageParam = 1,
    type = 'lead',
    limit,
    status,
    individual,
    pagination = true,
    srManager,
    manager,
    assistantManager,
    teamLead,
    agent,
    startDate,
    endDate,
    skipType,
}) => {
    try {
        const response = await axiosInstance.get('api/lead', {
            params: {
                page: pageParam,
                search,
                type,
                ...(limit && { limit }),
                ...(status && { status }),
                ...(individual && { individual }),
                ...(pagination && { pagination }),
                ...(srManager && { srManager }),
                ...(manager && { manager }),
                ...(assistantManager && { assistantManager }),
                ...(teamLead && { teamLead }),
                ...(agent && { agent }),
                ...(startDate && { startDate }),
                ...(endDate && { endDate }),
                ...(skipType && { skipType }),
            },
        });
        return response.data
    }
    catch (err) {
        console.log('getLeadErrPag', err)
    }
}

export const getLeadPool = async ({
    pageParam = 1,
    search = '',
    type = 'lead',
    limit = 10,
    pagination = true
}) => {
    try {
        const response = await axiosInstance.get('api/lead/leadPoolList', {
            params: {
                page: pageParam,
                search,
                type,
                limit: limit,
                pagination: pagination
            }
        });
        return response.data
    }
    catch (err) {
        console.log('getLeadPoolErr', err)
    }
}

export const assigningUser = ({
    srManager = null,
    search = null,
}) => {
    console.log('srManager@@#', srManager)
    return axiosInstance.get('api/user/assigningUsers', {
        params: {
            srManager,
            search
        }
    })
        .then(res => {
            myConsole('res?.data', res?.data)
            return res?.data
        })
        .catch(err => {
            myConsole('assigningUserErr', err?.response?.data)
            throw new Error(err);
        })
}

export const addLeadNote = ({ id, note }) => {
    return axiosInstance.post(`/api/lead/addNotes/${id}`, { note })
        .then((res) => res?.data)
        .catch(err => {
            myConsole('errUpdateCase', err?.response?.data)
            throw new Error(err);
        })
}

export const getUserInfoLeadDeatil = async (id: string) => {
    try {
        const res = await axiosInstance.get(`/api/lead/getAssignedHistory/${id}`);
        return res?.data?.data || []
    }
    catch (err) {
        myConsole('userInfoErr', err)
    }
}

export const getLogsInfoLeadDeatil = async (id: string) => {
    try {
        const res = await axiosInstance.get(`/api/lead/getStatusHistory/${id}`);
        return res?.data?.data || []
    }
    catch (err) {
        myConsole('userInfoErr', err)
    }
}

export const claimLead = async (id: string) => {
    try {
        popupModal2.wantLoading('Do yo want to claim!');
        const res = await axiosInstance.post(`/api/lead/claimLead/${id}`);
        popUpConfToast.successMessage(res?.data?.message || 'Claimed Succefully')
        return res?.data?.data || []
    }
    catch (err) {
        popUpConfToast.errorMessage(err?.response?.data || 'Something went wrong')
        myConsole('claimLeadErr', err?.response?.data)
    }
}
export const deleteLeadsByIds = async (ids: string[]) => {
    try {
        popupModal2.wantLoading();
        const res = await axiosInstance.post(`/api/lead/deleteLeadsByIds`, ids);
        popUpConfToast.successMessage(res?.data?.message || 'Deleted Successfully')
        return res?.data?.data || []
    }
    catch (err) {
        popUpConfToast.errorMessage(err?.response?.data || 'Something went wrong')
        // myConsole('claimLeadErr', err?.response?.data)
        myConsole('err', err)
    }
}
// claimLead

const fetchLatestMeetings = async (id) => {
    try {
        const res = await axiosInstance.get(`/api/meeting/getLatestMeetings/${id}`);
        return res?.data?.data || [];
    } catch (err) {
        throw err;
    }
};

export const useLatestMeetings = (id) => {
    return useQuery({
        queryKey: ['latestMeetings', id],
        queryFn: () => fetchLatestMeetings(id),
        enabled: !!id, // Prevents query from running if id is not provided
    });
};


