import { axiosInstance } from "../authApi/axiosInstance";

export const getAllDevelopers = () =>
    axiosInstance.get('/api/developer')
        .then(res => res?.data)