import { axiosInstance } from "./axiosInstance";


export const login = (data: any) =>
    axiosInstance.post('/api/auth/login', data)
        .then(res => res?.data)

export const logOut = (id: string) =>
    axiosInstance.post(`/api/auth/logout/${id}`)
        .then(res => res?.data)  