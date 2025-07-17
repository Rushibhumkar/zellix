import { myConsole } from "../../hooks/useConsole";
import { popUpConfToast } from "../../utils/toastModalByFunction";
import { axiosInstance } from "../authApi/axiosInstance";

export const checkInOutApiFn = ({ data }) =>
    axiosInstance.post(`/api/hrms/att/remotePunch`, data)
        .then(res => res?.data)
        .catch(err => {
            myConsole('error22', err)
            popUpConfToast.errorMessage(err.response.data ?? '--')
        })
//data={type:'punchIn/punchOut',developerId,meetingId,selected:'meeting/developer',coor:{lat,lng}}
export const getDeveloperForCheckInOut = () =>
    axiosInstance.get('/api/developer/getDeveloperOptions')
        .then(res => res?.data)

export const getMeetingForCheckInOut = () =>
    axiosInstance.get('/api/meeting/getTodaysMeetings')
        .then(res => res?.data)