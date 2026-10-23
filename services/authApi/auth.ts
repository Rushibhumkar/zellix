import { axiosInstance } from "./axiosInstance";
import { getData } from "../../hooks/useAsyncStorage";
import * as Device from "expo-device";
import { Alert, Platform } from "react-native";


export const login = async (data: any) => {
    const payload: Record<string, any> = {
        ...data,
        platform: Platform.OS === "ios" ? "iOS" : Platform.OS === "android" ? "Android" : "Web",
        deviceName: [Device.manufacturer, Device.modelName || Device.deviceName, Device.osVersion].filter(Boolean).join(" ").slice(0, 160),
    };
    // Older deployed validators reject new session metadata before authenticating.
    // Keep full metadata on current servers; only retry an explicit unknown-field
    // 400 rejection. Never retry credential/session-limit/network failures.
    for (let attempt = 0; ; attempt++) {
        try {
            return (await axiosInstance.post('/api/auth/login', { ...payload })).data;
        } catch (error: any) {
            const body = error?.response?.data;
            const message = typeof body === "string" ? body : body?.message;
            const field = typeof message === "string"
                ? message.trim().match(/^["']?(platform|deviceName)["']? is not allowed$/)?.[1]
                : undefined;
            if (attempt >= 2 || error?.response?.status !== 400 || !field || !(field in payload)) throw error;
            delete payload[field];
        }
    }
};

export const logOut = async (id: string) => {
    const deviceId = await getData("deviceId");
    return axiosInstance
        .post(`/api/auth/logout/${id}`, {
            ...(typeof deviceId === "string" && deviceId ? { deviceId } : {}),
        })
        .then(res => res?.data)
        .catch(error => {
            if (error?.response?.status === 401) return "Session already closed";
            Alert.alert("Could not confirm logout", "Check your connection and retry. Your local login has been kept so you can try again.");
            throw error;
        });
};
