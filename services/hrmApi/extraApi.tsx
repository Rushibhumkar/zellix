import { axiosInstance } from "../authApi/axiosInstance"

export const getNotificationHrm = ({ pageParam = 1 }) => {
    return axiosInstance.get(`/api/hrms/user/getNotifications`, {
        params: {
            page: pageParam,
            per_page: 15
        }
    })
        .then(res => res?.data)
        .catch((err) => console.log('errorGetAttendanceChart', err))
}

export const getNotificationInCRM = ({ pageParam = 1, id }) => {
    return axiosInstance.get(`/api/user/getNotificationsById/${id}`, {
        params: {
            page: pageParam
        }
    })
        .then(res => res?.data)
        .catch((err) => console.log('errorGetAttendanceChart', err))
}