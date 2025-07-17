import { Platform } from "react-native";
import { axiosInstance } from "../services/authApi/axiosInstance";
import mime from "mime";
import { myConsole } from "../hooks/useConsole";

interface TUploadFile {
    file: any; //array of object
    onLoading?: any;
    getUrl: any;
    place?: any;
}

export const uploadFile = async ({ file, place, onLoading, getUrl }: TUploadFile) => {
    const ios = Platform.OS === "ios" ? true : false;
    onLoading?.(true);
    const formData = new FormData();
    //apend code
    if (!!file && file?.length > 0) {
        file.forEach((el: any) => {
            formData.append('files', {
                uri: ios ? el?.uri : el?.uri,
                type: ios ? el?.type : mime.getType(el?.uri),
                name: ios
                    ? el?.fileName
                    : el?.uri?.split("/").pop(),
            });
        })
    }
    // formData.append('place', place);
    //
    try {
        const response = await axiosInstance.post('/api/media/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        getUrl?.(response?.data?.urls || []);
    }
    catch (error) {
        myConsole('Upload errorK:', error.response);
    }
    finally {
        onLoading?.(false);
    }
}