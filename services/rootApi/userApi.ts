import { myConsole } from "../../hooks/useConsole";
import { axiosInstance } from "../authApi/axiosInstance";

interface TAddUser {
    name: string;
    email: string;
    role: string;
}

export const addUser = (data: TAddUser) =>
    axiosInstance.post('/api/user', data)
        .then(res => res)

export const updateUser = ({ id, data }) =>
    axiosInstance.post(`/api/user/userUpdateById/${id}`, data)
        .then(res => res)

export const deleteUser = (id: string) =>
    axiosInstance.delete(`/api/user/${id}`)
        .then(res => res)

export const getNotificationSeenById = (id: string, notifyId: string) => {
    return axiosInstance.post(`/api/user/notificationSeenById/${id}`, { notifyId })
        .then(res => {
            myConsole('resultNoti', res?.data)
            return res
        })
}

export const getNotificationById = (id: string) => {
    return axiosInstance.get(`/api/user/getNotificationById/${id}`)
        .then(res => res)
}

export const changePassword = (id, data) => {
    return axiosInstance.post(`/api/user/changePassword/${id}`, data)
        .then(res => res)

}





