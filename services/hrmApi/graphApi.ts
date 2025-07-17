import { axiosInstance } from "../authApi/axiosInstance"

export const getAttendanceChart = () => {  //-->attendance graph
    return axiosInstance.get(`/api/hrms/dashboard`)
        .then(res => res?.data?.data)
        .catch((err) => console.log('errorGetAttendanceChart', err))
}

export const getAgentLeaveCount = () => {
    return axiosInstance.get(`/api/hrms/dashboard/creditleaves`)
        .then(res => res?.data?.data)
        .catch((err) => console.log('errorGetAgentLeaveCount', err))
}

export const getLeaveChart = () => {  //-->attendance graph
    return axiosInstance.get(`/api/hrms/leave/dashboardData`)
        .then(res => res?.data?.data)
        .catch((err) => console.log('errorGetLeaveChart', err))
}

export const getUserStatusChart = () => {  //-->attendance graph
    return axiosInstance.get(`/api/hrms/user/dashboardData`)
        .then(res => res?.data?.data)
        .catch((err) => console.log('errorGetUserStatusChart', err))
}