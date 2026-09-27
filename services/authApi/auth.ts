import { axiosInstance } from "./axiosInstance";
import { getData } from "../../hooks/useAsyncStorage";


export const login = (data: any) =>
    axiosInstance.post('/api/auth/login', data)
        .then(res => res?.data)

export const logOut = async (id: string) => {
    const deviceId = await getData("deviceId");
    return axiosInstance
        .post(`/api/auth/logout/${id}`, {
            ...(typeof deviceId === "string" && deviceId ? { deviceId } : {}),
        })
        .then(res => res?.data);
};
