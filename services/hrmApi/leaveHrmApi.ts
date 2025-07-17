import { myConsole } from "../../hooks/useConsole";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { axiosInstance } from "../authApi/axiosInstance";

interface TLeaveApproveReject {
    id: string;
    remarks: string;
    key: 'leaveRejectById' | 'leaveApproveById'
}
interface TGetAllLeave { pageParam: number; search: string | null; startDate: string; endDate: string }
export const getAllLeave = ({ pageParam = 1, search = null, startDate = '', endDate = '' }: TGetAllLeave) =>
    axiosInstance.get('/api/hrms/leave', {
        params: {
            page: pageParam,
            search,
            startDate,
            endDate
        }
    })
        .then(res => {
            // myConsole('getAllLeave Res', res)
            return res?.data
        })

export const getTodayLeave = () =>
    axiosInstance.get('/api/hrms/leave', {
        params: { page: 1, search: 'approved', today: true }
    }).then(res => res?.data)

export const addLeave = (data) =>
    axiosInstance.post('/api/hrms/leave', data, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
        .then(res => {
            popUpConfToast.successMessage(res?.data?.message)
            return res?.data
        })
        .catch(err => {
            popUpConfToast.errorMessage(err?.response?.data)
        })
//multipart-->formData m data key m--> name,lastName,role,reason,startDate,endDate,remarks,//formData m attachments key m-->multiple image

export const getLeaveDetail = ({ id }) =>
    axiosInstance.get(`/api/hrms/leave/getDetailsById/${id}`)
        .then(res => res?.data)

export const leaveApprove = ({ id, data }) =>
    axiosInstance.post(`/api/hrms/leave/leaveApproveById/${id}`, data)
        .then(res => res?.data)

export const leaveReject = ({ id, data }) =>
    axiosInstance.post(`/api/hrms/leave/leaveRejectById/${id}`, data)
        .then(res => res?.data)

export const leaveApproveReject = ({ id, remarks, key }: TLeaveApproveReject) =>
    axiosInstance.post(`/api/hrms/leave/${key}/${id}`, { remarks })
        .then(res => {
            return res?.data
        })
        .catch(err => {
            myConsole('errLeaveApproveReject', err);
            popUpConfToast.errorMessage(err?.response?.data ?? '--')
        })

export const getLeaveDashboardData = () =>
    axiosInstance.get('/api/hrms/leave/dashboardData')
        .then(res => res?.data)